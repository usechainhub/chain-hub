import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SecurityScanRecord } from '@chain-hub/contracts';

import { AssetSecurityCard } from './AssetSecurityCard';

function scan(overrides: Partial<SecurityScanRecord>): SecurityScanRecord {
  return {
    verdict: 'pass',
    findings: [],
    contentHash: 'abc',
    scannedAt: '2026-11-01T00:00:00.000Z',
    context: 'install',
    engines: ['static'],
    ...overrides
  };
}

describe('AssetSecurityCard', () => {
  it('renders nothing without a scan', () => {
    const { container } = render(<AssetSecurityCard isRescanning={false} onRescan={() => {}} scan={null} />);
    expect(container.firstElementChild).toBeNull();
  });

  it('shows the pass verdict with no findings', () => {
    render(<AssetSecurityCard isRescanning={false} onRescan={() => {}} scan={scan({ verdict: 'pass' })} />);
    expect(screen.getByText('Pass')).toBeTruthy();
    expect(screen.getByText(/No suspicious behavior found/)).toBeTruthy();
  });

  it('marks overridden scans as allowed anyway', () => {
    render(
      <AssetSecurityCard
        isRescanning={false}
        onRescan={() => {}}
        scan={scan({ verdict: 'warn', overriddenAt: '2026-11-01T00:00:00.000Z' })}
      />
    );
    expect(screen.getByText(/Allowed anyway/)).toBeTruthy();
  });

  it('lists findings with severity badges and calls onRescan', () => {
    const onRescan = vi.fn();
    render(
      <AssetSecurityCard
        isRescanning={false}
        onRescan={onRescan}
        scan={scan({
          verdict: 'fail',
          findings: [
            {
              ruleId: 'remote-code-exec',
              severity: 'high',
              engine: 'static',
              title: 'Downloads and executes remote code',
              detail: 'Pipes remote content into a shell.',
              file: 'SKILL.md',
              line: 3
            }
          ]
        })}
      />
    );
    expect(screen.getByText('Blocked')).toBeTruthy();
    expect(screen.getByText('high')).toBeTruthy();
    expect(screen.getByText(/SKILL\.md:3/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Rescan/ }));
    expect(onRescan).toHaveBeenCalledTimes(1);
  });
});
