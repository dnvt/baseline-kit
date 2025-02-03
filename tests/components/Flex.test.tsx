import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { CSSProperties } from 'react';
import { Flex } from '@components';
import * as hooks from '@hooks';
import { parsePadding } from '@utils';

vi.mock('@hooks', () => ({
  useConfig: vi.fn(),
  useDebug: vi.fn(),
  useMeasure: vi.fn(),
  useBaseline: vi.fn(),
  useVirtual: vi.fn(),
}));

vi.mock('@utils', () => ({
  parsePadding: vi.fn(),
  cs: (...args: any[]) => Object.assign({}, ...args),
  cx: (...classes: any[]) => classes.filter(Boolean).join(' '),
  // Added formatValue to satisfy the import in Flex.
  formatValue: (value: any, defaultValue: number | undefined) => {
    if (value === undefined && defaultValue !== undefined) {
      return `${defaultValue}px`;
    }
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value || '';
  },
}));

vi.mock('@components/Config', () => ({
  Config: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@components/Padder', () => ({
  Padder: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="padder">{children}</div>
  ),
}));

vi.mock('./styles.module.css', () => ({
  default: { flex: 'flex' },
}));

describe('Flex Component', () => {
  beforeEach(() => {
    vi.mocked(hooks.useConfig).mockImplementation((component) => ({
      base: 8,
      debugging: 'visible',
      colors: { line: 'red', flat: 'blue', indice: 'green' },
    }));

    vi.mocked(hooks.useMeasure).mockReturnValue({
      width: 1024,
      height: 768,
      refresh: vi.fn(),
    });

    // Update the useBaseline mock to return snapped padding.
    vi.mocked(hooks.useBaseline).mockImplementation((_, { spacing }) => ({
      padding: {
        top: 8,       // snapped from block[0]=10
        bottom: 16,   // snapped from block[1]=20
        left: 8,      // snapped from inline[0]=5
        right: 16,    // snapped from inline[1]=15
      },
      isAligned: true,
      height: 0,
    }));

    vi.mocked(hooks.useDebug).mockImplementation((debug) => ({
      isShown: debug === 'visible',
      isHidden: debug === 'hidden',
      isNone: debug === 'none',
    }));

    vi.mocked(parsePadding).mockImplementation((props) => ({
      initTop: props.block?.[0] || 0,
      initBottom: props.block?.[1] || 0,
      left: props.inline?.[0] || 0,
      right: props.inline?.[1] || 0,
    }));
  });

  afterEach(() => vi.clearAllMocks());

  it('renders with default props', () => {
    render(<Flex>Content</Flex>);
    const flex = screen.getByTestId('flex');

    expect(flex).toHaveStyle({
      display: 'flex',
      "flex-direction": 'row',
      "justify-content": 'flex-start',
      "align-items": 'stretch',
      width: '1024px',
      height: '768px',
    });
  });

  it('applies custom layout props', () => {
    render(
      <Flex direction="column" justify="center" align="flex-end">
        Test
      </Flex>
    );

    expect(screen.getByTestId('flex')).toHaveStyle({
      "flex-direction": 'column',
      "justify-content": 'center',
      "align-items": 'flex-end',
    });
  });

  it('merges custom className and style', () => {
    render(
      <Flex className="custom" style={{ background: 'red' }}>
        Test
      </Flex>
    );
    const flex = screen.getByTestId('flex');
    expect(flex).toHaveClass('custom');
    expect(flex).toHaveStyle('background: red');
  });

  it('applies direct padding when debugging="none"', () => {
    vi.mocked(hooks.useDebug).mockImplementation(() => ({
      isShown: false,
      isHidden: false,
      isNone: true,
    }));
    render(
      <Flex debugging="none" block={[10, 20]} inline={[5, 15]}>
        Test
      </Flex>
    );
    expect(screen.getByTestId('flex')).toHaveStyle({
      "padding-block": '8px 16px',
      "padding-inline": '8px 16px',
    });
  });

  it('warns about height alignment', () => {
    vi.mocked(hooks.useMeasure).mockReturnValueOnce({
      width: 1024,
      height: 767, // Not a multiple of 8.
      refresh: vi.fn(),
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Flex>Test</Flex>);
    expect(warnSpy).toHaveBeenCalledWith(
      'Flex component: measured height (767px) is not a multiple of base (8px).'
    );
  });
});