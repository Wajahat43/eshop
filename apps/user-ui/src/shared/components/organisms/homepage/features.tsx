import { CalendarClock, MessageCircle, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure payments powered by Stripe',
    description: 'Instant, PCI-compliant checkout flows with buyer protection for every multi-vendor order you place.',
  },
  {
    icon: MessageCircle,
    title: 'Real-time chat with sellers',
    description:
      'Start a conversation before you buy, get sizing advice, and resolve questions without leaving the page.',
  },
  {
    icon: CalendarClock,
    title: 'Live drops and community events',
    description:
      'Track limited releases and collaborative events as they go live, complete with countdowns and reminders.',
  },
  {
    icon: PackageCheck,
    title: 'Transparent order tracking',
    description:
      'Follow every order from payment to delivery with status updates, tracking numbers, and shop messaging built in.',
  },
  {
    icon: Sparkles,
    title: 'Curated discovery playlists',
    description:
      'Jump into stylist-built collections and algorithmic picks that adapt to your taste and location data.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="mx-auto w-[90%] max-w-8xl py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Why NextCart works</p>
        <h2 className="mt-4 font-Poppins text-3xl font-semibold text-foreground sm:text-4xl">
          Built-in features that make shopping feel calmer
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Everything from payments to post-purchase support lives in one place, so you can focus on discovering new
          favourites without juggling tabs.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-border/60 bg-background/80 p-6 text-left transition-transform duration-200 hover:-translate-y-1 hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-primary">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
