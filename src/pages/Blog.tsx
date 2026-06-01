import SiteLayout from '@/components/layout/SiteLayout';
import Seo, { SITE_URL } from '@/components/Seo';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { blogPosts } from '@/data/blog';

export default function Blog() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'KingBet Exchange Blog',
    url: `${SITE_URL}/blog`,
    blogPost: blogPosts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.date,
      url: `${SITE_URL}/blog/${p.slug}`,
      description: p.excerpt,
    })),
  };

  return (
    <SiteLayout>
      <Seo
        title="Crypto Investing Blog — Guides, Security & Strategy | KingBet Exchange"
        description="Practical guides on how to invest in crypto safely, wallet security best practices, payouts, and compounding strategies from KingBet Exchange."
        path="/blog"
        schema={schema}
      />
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mb-12 animate-fade-up">
          <span className="text-xs font-semibold tracking-widest text-gold uppercase">Insights</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mt-3">
            The KingBet <span className="text-gradient-gold">Crypto Blog</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Learn how to invest in crypto safely, secure your wallet, and grow your portfolio with practical, no-hype guides.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="glass rounded-2xl p-6 flex flex-col hover:border-gold/30 border border-white/5 transition-colors group"
            >
              <span className="text-xs font-semibold text-gold uppercase tracking-wide">{post.category}</span>
              <h2 className="font-display text-xl font-bold mt-3 group-hover:text-gold transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-3 flex-1">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-5">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {post.readingTime}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-sm text-gold mt-4 font-medium">
                Read article <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
