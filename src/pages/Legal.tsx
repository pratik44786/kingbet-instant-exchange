import SiteLayout from '@/components/layout/SiteLayout';

const SECTIONS = {
  terms: {
    title: 'Terms of Service',
    updated: 'May 2026',
    body: [
      ['Acceptance', 'By accessing or using KINGBET EXCHANGE you agree to be bound by these terms. If you do not agree, do not use the platform.'],
      ['Eligibility', 'You must be at least 18 years old and not a resident of a restricted jurisdiction. You are responsible for ensuring your use complies with local laws.'],
      ['Investment risk', 'All investments carry risk, including loss of principal. Historical returns do not guarantee future performance.'],
      ['Account responsibilities', 'You are responsible for all activity under your account. Keep credentials and 2FA secrets confidential.'],
      ['Suspension', 'We may suspend or close accounts that violate these terms, suspected fraud, or applicable law.'],
      ['Limitation of liability', 'To the maximum extent permitted by law, KINGBET EXCHANGE is not liable for indirect, incidental or consequential damages.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'May 2026',
    body: [
      ['Data we collect', 'Account information (email, name, phone), KYC documents, device/usage data, and on-chain transaction references.'],
      ['How we use data', 'To operate the platform, verify identity, prevent fraud, comply with law and improve the service.'],
      ['Sharing', 'We share data with regulators, payment partners and service providers under strict confidentiality. We never sell your data.'],
      ['Retention', 'KYC and transaction records are retained for the period required by applicable AML regulation.'],
      ['Your rights', 'You may request access, correction, deletion (subject to legal retention) of your data via support.'],
    ],
  },
  aml: {
    title: 'AML / KYC Policy',
    updated: 'May 2026',
    body: [
      ['Identity verification', 'All users must complete identity verification before withdrawing. We collect government-issued ID and a selfie.'],
      ['Transaction monitoring', 'Deposits and withdrawals are monitored for suspicious patterns. Accounts flagged for review may be suspended pending investigation.'],
      ['Restricted jurisdictions', 'Residents of OFAC-sanctioned countries and other restricted regions are not eligible.'],
      ['Source of funds', 'Large deposits may require additional documentation of source of funds.'],
      ['Reporting', 'We cooperate with law-enforcement and regulators as required.'],
    ],
  },
  risk: {
    title: 'Risk Disclosure',
    updated: 'May 2026',
    body: [
      ['Market risk', 'Crypto-asset values fluctuate significantly. Investment products may underperform projections.'],
      ['Liquidity risk', 'Withdrawals may take longer during periods of network congestion or operational review.'],
      ['Cyber risk', 'Despite industry-standard protection, no platform is fully immune to security incidents.'],
      ['Regulatory risk', 'Crypto regulation evolves quickly and may impact available services.'],
      ['Do your own research', 'Only invest what you can afford to lose. Consult a licensed financial advisor if uncertain.'],
    ],
  },
} as const;

export default function LegalPage({ doc }: { doc: keyof typeof SECTIONS }) {
  const s = SECTIONS[doc];
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <p className="text-xs text-gold uppercase tracking-widest mb-2">Last updated · {s.updated}</p>
        <h1 className="section-heading mb-6"><span className="text-gradient-gold">{s.title}</span></h1>
        <div className="card-premium space-y-6">
          {s.body.map(([title, body]) => (
            <div key={title}>
              <h2 className="font-display text-xl font-semibold mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
