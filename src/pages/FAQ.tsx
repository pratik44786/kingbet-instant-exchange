import SiteLayout from '@/components/layout/SiteLayout';
import Seo, { SITE_URL } from '@/components/Seo';
import { Link } from 'react-router-dom';
import { ArrowRight, HelpCircle } from 'lucide-react';

const categories: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: 'Getting Started',
    items: [
      { q: 'What is KingBet Exchange?', a: 'KingBet Exchange is a modern crypto investment platform that lets you grow your holdings through managed investment plans with consistent returns, fortnightly payouts, and instant withdrawals.' },
      { q: 'How do I create an account?', a: 'Click "Get Started", enter your details, and confirm your account. Once registered, you can deposit crypto, choose a plan, and start earning.' },
      { q: 'What is the minimum investment?', a: 'Our Starter plan begins at just $100. You can upgrade to Premium or Elite plans anytime from your dashboard.' },
    ],
  },
  {
    title: 'Deposits & Withdrawals',
    items: [
      { q: 'Which cryptocurrencies can I deposit?', a: 'We support USDC and USDT across Ethereum (ERC-20), Solana, BNB Smart Chain (BEP-20), and Tron (TRC-20), plus BTC and ETH. Always use the exact network shown on the deposit page.' },
      { q: 'How long do deposits take?', a: 'Deposits are credited after network confirmations and a quick review, usually within minutes. Submit your transaction hash on the deposit page to speed things up.' },
      { q: 'How fast are withdrawals?', a: 'Withdrawal requests are reviewed and processed quickly, typically within minutes. Funds are sent to the wallet address you provide.' },
      { q: 'Are there withdrawal fees?', a: 'Only standard blockchain network fees apply. KingBet Exchange does not add hidden charges to your withdrawals.' },
    ],
  },
  {
    title: 'Returns & Plans',
    items: [
      { q: 'How are returns generated?', a: 'Capital is deployed across staking, market making, and arbitrage strategies on top-tier exchanges to deliver consistent fortnightly profit distributions.' },
      { q: 'When are profits paid?', a: 'Profits are credited to your wallet fortnightly. You can reinvest for compounding or withdraw at any time.' },
      { q: 'Can I have multiple active plans?', a: 'Yes. You can run multiple investment plans simultaneously, each tracked separately in your dashboard.' },
    ],
  },
  {
    title: 'Security & Support',
    items: [
      { q: 'Is my crypto safe?', a: 'The majority of user funds are held in cold multi-signature wallets, with the remainder in insured hot wallets for liquidity. We also offer 2FA to protect your account.' },
      { q: 'How do I enable two-factor authentication?', a: 'Go to Security in your dashboard and enable TOTP-based 2FA using any authenticator app for an extra layer of protection.' },
      { q: 'How do I contact support?', a: 'Email support@kingbetexchange.live any time. Our team offers 24/7 assistance for all account and transaction queries.' },
    ],
  },
];

export default function FAQ() {
  const allFaqs = categories.flatMap(c => c.items);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${SITE_URL}/faq` },
    ],
  };

  return (
    <SiteLayout>
      <Seo
        title="FAQ — Deposits, Withdrawals, Returns & Security | KingBet Exchange"
        description="Answers to common questions about KingBet Exchange: how to invest, supported cryptocurrencies, deposit and withdrawal times, returns, payouts, and account security."
        path="/faq"
        schema={[faqSchema, breadcrumb]}
      />

      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-gold mb-5">
          <HelpCircle className="h-3.5 w-3.5" /> Help Center
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold">
          Frequently asked <span className="text-gradient-gold">questions</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about investing, deposits, withdrawals, and keeping your account secure.
        </p>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="space-y-12">
          {categories.map(cat => (
            <div key={cat.title}>
              <h2 className="font-display text-2xl font-bold mb-5">{cat.title}</h2>
              <div className="space-y-3">
                {cat.items.map(f => (
                  <details key={f.q} className="card-premium group cursor-pointer">
                    <summary className="font-semibold flex justify-between items-center list-none gap-4">
                      {f.q}
                      <span className="text-gold group-open:rotate-45 transition-transform text-xl shrink-0">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="card-premium text-center max-w-2xl mx-auto">
          <h2 className="section-heading">Still have questions?</h2>
          <p className="mt-4 text-muted-foreground">Our support team is available 24/7 to help you get started.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-gold">Create Free Account <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/plans" className="btn-outline-gold">View Plans</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
