import { useMemo, useCallback } from 'react'
import { AutoConfig, DEFAULT_CONFIG, GuideColumnsPattern, GuideConfig, LineConfig } from '@components'
import {
  isValidGuidePattern,
  parseCSSValue,
  convertToPixels,
  ABSOLUTE_UNITS,
  RELATIVE_UNITS,
} from '@utils'
import { useConfig } from '@hooks'

type Props = {
  containerWidth: number
  config: GuideConfig
}

type Result = {
  gridTemplateColumns: string
  columnsCount: number
  calculatedGap: number
  isValid: boolean
}

export function useGuideCalculations({
  containerWidth,
  config,
}: Props): Result {
  const { base } = useConfig('guide')

  // Helper: line variant ------------------------------------------------------

  const calculateLineVariant = useMemo(() =>
    (cfg: LineConfig, width: number): Result => {
      const gap = cfg.gap ?? 8
      const columns = Math.max(1, Math.floor(width / (gap + 1)) + 1)

      return {
        gridTemplateColumns: `repeat(${columns}, 1px)`,
        columnsCount: columns,
        calculatedGap: gap,
        isValid: true,
      }
    },
  [])

  // Helper: pattern variant ---------------------------------------------------

  const calculateColumnPattern = useMemo(() =>
    (cfg: GuideConfig & { columns: GuideColumnsPattern }): Result => {
      if (!isValidGuidePattern(cfg.columns)) {
        throw new Error('Invalid grid column pattern')
      }

      const columns = cfg.columns.map(col => {
        if (typeof col === 'number') {
          return `${col}px`
        }
        if (typeof col === 'string') {
          if (col === '0px') {
            return '0'
          }
          if (col === 'auto' || /^\d+(?:fr|px|%|em|rem)$/.test(col)) {
            return col
          }
          if (/^\d+$/.test(col)) {
            return `${col}px`
          }
        }
        return '0'
      })

      const isValid = columns.every(c => c !== '0')
      if (!isValid) {
        return {
          gridTemplateColumns: 'none',
          columnsCount: 0,
          calculatedGap: 0,
          isValid: false,
        }
      }

      return {
        gridTemplateColumns: columns.join(' '),
        columnsCount: columns.length,
        calculatedGap: cfg.gap ?? 0,
        isValid: true,
      }
    },
  [])

  // Helper: fixed variant -----------------------------------------------------

  const calculateFixedColumns = useCallback(
    (cfg: GuideConfig & { columns: number }): Result => {
      if (cfg.columns <= 0) {
        throw new Error(`Invalid columns count: ${cfg.columns}`)
      }

      return {
        gridTemplateColumns: `repeat(${cfg.columns}, ${
          cfg.columnWidth ? parseCSSValue(cfg.columnWidth) : '1fr'
        })`,
        columnsCount: cfg.columns,
        calculatedGap: cfg.gap ?? 0,
        isValid: true,
      }
    },
    [],
  )

  // Helper: auto variant ------------------------------------------------------

  const calculateAutoGuide = useCallback(
    (cfg: AutoConfig, width: number): Result => {
      const gap = cfg.gap ?? base
      const columnWidth = cfg.columnWidth

      if (columnWidth === 'auto') {
        return {
          gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
          columnsCount: 1,
          calculatedGap: gap,
          isValid: true,
        }
      }

      const columnWidthStr = typeof columnWidth === 'number'
        ? `${columnWidth}px`
        : columnWidth as string

      if (columnWidthStr.endsWith('fr')) {
        return {
          gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidthStr}, 1fr))`,
          columnsCount: 1,
          calculatedGap: gap,
          isValid: true,
        }
      }

      if (ABSOLUTE_UNITS.some(unit => columnWidthStr.endsWith(unit))) {
        const pixels = convertToPixels(columnWidthStr) ?? 0
        const columns = Math.max(1, Math.floor((width + gap) / (pixels + gap)))
        return {
          gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidthStr}, 1fr))`,
          columnsCount: columns,
          calculatedGap: gap,
          isValid: true,
        }
      }

      if (RELATIVE_UNITS.some(unit => columnWidthStr.endsWith(unit))) {
        return {
          gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidthStr}, 1fr))`,
          columnsCount: 1,
          calculatedGap: gap,
          isValid: true,
        }
      }

      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: 0,
        isValid: false,
      }
    },
    [base],
  )

  // Main Hook Logic -----------------------------------------------------------

  return useMemo(() => {
    if (!containerWidth) {
      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: 0,
        isValid: false,
      }
    }

    try {
      switch (config.variant) {
      case 'line':
        return calculateLineVariant(config, containerWidth)
      case 'pattern':
        return calculateColumnPattern(config)
      case 'fixed':
        return calculateFixedColumns(config)
      case 'auto':
        return calculateAutoGuide(config, containerWidth)
      default:
        return calculateLineVariant({
          variant: 'line',
          base: base,
          gap: DEFAULT_CONFIG.base,
        }, containerWidth)
      }
    } catch (error) {
      console.warn('Error calculating grid layout:', error)
      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: 0,
        isValid: false,
      }
    }
  }, [
    containerWidth,
    config,
    base,
    calculateLineVariant,
    calculateColumnPattern,
    calculateFixedColumns,
    calculateAutoGuide,
  ])
}
