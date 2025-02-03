import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { CSSProperties } from 'react';
import { Layout } from '@components';
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
}));

// Update the Padder mock to render inline style for custom properties.
vi.mock('@components/Padder', () => ({
  Padder: ({
    children,
    width,
    height,
  }: {
    children: React.ReactNode;
    width?: string;
    height?: string;
  }) => (
    <div
      data-testid="padder"
      style={{ '--pdd-padder-width': width, '--pdd-padder-height': height } as CSSProperties}
    >
      {children}
    </div>
  ),
}));

describe('Layout Component', () => {
  beforeEach(() => {
    vi.mocked(hooks.useConfig).mockImplementation((component) => ({
      base: 8,
      debugging: 'visible',
      colors: { line: '#ff0000' },
    }));

    vi.mocked(hooks.useMeasure).mockReturnValue({
      width: 1024,
      height: 768,
      refresh: vi.fn(),
    });

    vi.mocked(hooks.useBaseline).mockImplementation((_, { spacing }) => ({
      padding: {
        top: spacing.initTop,
        bottom: spacing.initBottom,
        left: spacing.left,
        right: spacing.right,
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

  it('renders with default grid layout', () => {
    render(<Layout>Content</Layout>);
    const layout = screen.getByTestId('layout');

    expect(layout).toHaveStyle({
      display: 'grid',
      "grid-template-columns": 'repeat(auto-fit, minmax(100px, 1fr))',
      "grid-template-rows": 'auto',
    });
  });

  it('applies column template from number prop', () => {
    render(<Layout columns={3}>Test</Layout>);
    expect(screen.getByTestId('layout')).toHaveStyle({
      "grid-template-columns": 'repeat(3, 1fr)',
    });
  });

  it('handles array column definition', () => {
    render(<Layout columns={['100px', 2, '1fr']}>Test</Layout>);
    expect(screen.getByTestId('layout')).toHaveStyle({
      "grid-template-columns": '100px 2px 1fr',
    });
  });

  it('applies gap and alignment props', () => {
    render(
      <Layout gap="1rem" justifyContent="center" alignItems="stretch">
        Test
      </Layout>
    );
    const layout = screen.getByTestId('layout');
    expect(layout).toHaveStyle({
      gap: '1rem',
      "justify-content": 'center',
      "align-items": 'stretch',
    });
  });

  it('integrates with Padder component', () => {
    render(<Layout block={[10, 20]} inline={8}>Test</Layout>);
    const padder = screen.getByTestId('padder');
    expect(padder).toBeInTheDocument();
    expect(padder).toHaveStyle({
      '--pdd-padder-width': '100%',
      '--pdd-padder-height': '100%',
    });
  });

  it('handles debug modes correctly', () => {
    const { rerender } = render(<Layout debugging="visible">Test</Layout>);
    expect(screen.getByTestId('layout')).toHaveClass('visible');

    rerender(<Layout debugging="hidden">Test</Layout>);
    expect(screen.getByTestId('layout')).toHaveClass('hidden');

    rerender(<Layout debugging="none">Test</Layout>);
    // If debugging is "none", we expect no debug class (i.e. not "visible")
    expect(screen.getByTestId('layout')).not.toHaveClass('visible');
  });

  it('applies custom className and style', () => {
    render(
      <Layout className="custom-layout" style={{ '--custom': 'value' } as CSSProperties}>
        Test
      </Layout>
    );
    const layout = screen.getByTestId('layout');
    expect(layout).toHaveClass('custom-layout');
    expect(layout).toHaveStyle('--custom: value');
  });

  it('provides column count through context', () => {
    render(
      <Layout columns={4}>
        {(context) => (
          <div data-testid="context-child">
            Columns: {context.columnsCount}
          </div>
        )}
      </Layout>
    );
    expect(screen.getByTestId('context-child')).toHaveTextContent('Columns: 4');
  });
});