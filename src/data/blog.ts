export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readingTime: string;
  category: string;
  /** Array of paragraphs / sections. Headings start with "## ". */
  content: string[];
  faqs?: { q: string; a: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-invest-in-crypto-safely',
    title: 'How to Invest in Crypto Safely: A Beginner-Friendly Guide',
    excerpt:
      'Learn the practical steps to invest in cryptocurrency safely — from securing your wallet to choosing a trustworthy platform and managing risk.',
    date: '2026-05-12',
    readingTime: '7 min read',
    category: 'Guides',
    content: [
      'Cryptocurrency can be a powerful way to grow your wealth, but only if you approach it with the right safeguards. This guide walks you through the fundamentals of investing in crypto safely, so you can participate with confidence rather than fear.',
      '## Start with security first',
      'Before you invest a single dollar, secure your accounts. Use a strong, unique password and enable two-factor authentication (2FA) everywhere. On KingBet Exchange you can turn on 2FA from your security settings in under a minute — it is the single most effective step you can take to protect your funds.',
      '## Only invest what you can afford to lose',
      'Crypto markets are volatile. A healthy rule is to allocate only a portion of your savings that would not affect your daily life if its value dropped. Diversifying across assets and investment plans helps smooth out short-term swings.',
      '## Choose a transparent platform',
      'Look for platforms that publish clear terms, store the majority of funds in cold storage, and offer instant, traceable withdrawals. Transparency around how returns are generated is a strong signal of legitimacy.',
      '## Reinvest thoughtfully',
      'Compounding your returns can accelerate growth, but always keep some liquidity. Many investors reinvest a fixed percentage of each payout and withdraw the rest, balancing growth with peace of mind.',
    ],
    faqs: [
      { q: 'Is crypto investing safe for beginners?', a: 'Yes, when you secure your account with 2FA, invest only what you can afford to lose, and use a transparent, reputable platform.' },
      { q: 'What is the safest way to start?', a: 'Start small with a starter plan, enable all security features, and learn how withdrawals and payouts work before increasing your investment.' },
    ],
  },
  {
    slug: 'understanding-fortnightly-crypto-payouts',
    title: 'Understanding Fortnightly Crypto Payouts and Compounding',
    excerpt:
      'How fortnightly payouts work, why compounding matters, and how to plan reinvestment to maximise long-term crypto returns.',
    date: '2026-05-02',
    readingTime: '6 min read',
    category: 'Investing',
    content: [
      'Fortnightly payouts give investors a predictable rhythm for receiving returns. Understanding how they interact with compounding can meaningfully change your long-term results.',
      '## What is a fortnightly payout?',
      'A fortnightly payout means profits are credited to your wallet every two weeks. This regular cadence lets you decide, on a frequent basis, whether to withdraw or reinvest.',
      '## The power of compounding',
      'When you reinvest each payout, your next payout is calculated on a larger base. Over months, this snowball effect can significantly outpace a strategy of withdrawing every cycle.',
      '## Building a reinvestment plan',
      'A common approach is the 70/30 split: reinvest 70% of each payout to grow your principal and withdraw 30% as realised profit. Adjust the ratio to match your goals and liquidity needs.',
    ],
    faqs: [
      { q: 'How often are profits paid?', a: 'Profits are credited to your wallet every two weeks (fortnightly). You can withdraw or reinvest at any time.' },
      { q: 'Does reinvesting increase returns?', a: 'Yes. Reinvesting compounds your principal, so each subsequent payout is calculated on a larger balance.' },
    ],
  },
  {
    slug: 'crypto-wallet-security-best-practices',
    title: 'Crypto Wallet Security: 8 Best Practices to Protect Your Funds',
    excerpt:
      'Practical, no-nonsense steps to keep your crypto wallet secure — covering 2FA, phishing, cold storage, and account hygiene.',
    date: '2026-04-20',
    readingTime: '8 min read',
    category: 'Security',
    content: [
      'Your wallet is only as safe as the habits around it. These eight best practices cover the most common ways funds are lost — and how to avoid them.',
      '## 1. Enable two-factor authentication',
      'Always turn on 2FA. It blocks the vast majority of unauthorised access attempts even if your password is leaked.',
      '## 2. Beware of phishing',
      'Never click links in unexpected emails or messages. Always navigate to the platform directly and verify the URL before logging in.',
      '## 3. Use cold storage for large balances',
      'Keep long-term holdings in cold, multi-signature storage. Only keep what you need for active investing in hot wallets.',
      '## 4. Keep your devices clean',
      'Update your operating system and browser regularly, and avoid installing untrusted browser extensions that can read page content.',
      '## 5. Verify withdrawal addresses',
      'Double-check the network and address before every withdrawal. A single wrong character can send funds to the wrong place permanently.',
    ],
    faqs: [
      { q: 'What is the most important wallet security step?', a: 'Enabling two-factor authentication. It protects your account even if your password is compromised.' },
      { q: 'Should I use cold storage?', a: 'For long-term or large holdings, yes. Cold, multi-signature storage keeps funds offline and far harder to steal.' },
    ],
  },
];

export const getPost = (slug: string) => blogPosts.find((p) => p.slug === slug);
