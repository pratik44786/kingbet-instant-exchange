import SiteLayout from '@/components/layout/SiteLayout';
import Seo, { SITE_URL } from '@/components/Seo';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { getPost } from '@/data/blog';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'KingBet Exchange' },
    publisher: {
      '@type': 'Organization',
      name: 'KingBet Exchange',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.jpg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 2, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  const faqSchema = post.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : undefined;

  const schema = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <SiteLayout>
      <Seo
        title={`${post.title} | KingBet Exchange`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        schema={schema}
      />
      <article className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>

        <span className="text-xs font-semibold text-gold uppercase tracking-wide">{post.category}</span>
        <h1 className="font-display text-3xl md:text-5xl font-extrabold mt-3 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-5">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readingTime}
          </span>
        </div>

        <div className="mt-10 space-y-5">
          {post.content.map((block, i) =>
            block.startsWith('## ') ? (
              <h2 key={i} className="font-display text-2xl font-bold pt-4">{block.replace('## ', '')}</h2>
            ) : (
              <p key={i} className="text-muted-foreground leading-relaxed">{block}</p>
            )
          )}
        </div>

        {post.faqs?.length ? (
          <div className="mt-14">
            <h2 className="font-display text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {post.faqs.map((f, i) => (
                <div key={i} className="glass rounded-xl p-5 border border-white/5">
                  <h3 className="font-semibold text-foreground">{f.q}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-14 glass rounded-2xl p-8 text-center border border-gold/20">
          <h2 className="font-display text-2xl font-bold">Ready to start investing safely?</h2>
          <p className="text-muted-foreground mt-2">Join 150,000+ investors growing their crypto wealth with KingBet Exchange.</p>
          <Link to="/register" className="btn-gold mt-6 inline-flex">Get Started</Link>
        </div>
      </article>
    </SiteLayout>
  );
}
