/**
 * Baseline Kit Styles System
 *
 * This file exports all core styles needed for the component library.
 * The import order is important:
 * 1. core.css - Contains reset.css, base.css, and component styles
 * 2. theme.css - Contains color variables and theming
 */

// Core styles must be imported before theme
import './core.css'
import './theme.css'

// Export component types for external usage
export * from '../types'

// Empty export to make this a proper module
export {}
