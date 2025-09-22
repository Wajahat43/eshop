import { SectionTitle } from '../../molecules/section-title';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../../components/ui/accordion';

const faqs = [
  {
    question: 'How does the marketplace curate product selections?',
    answer:
      'We blend shopper behaviour, community trends, and partner launches to surface collections that feel personal every time you visit.',
  },
  {
    question: 'Can I save products or shops for later?',
    answer:
      'Yes. Add items to your wishlist or follow your favourite shops to get alerts when new drops and restocks go live.',
  },
  {
    question: 'What payment methods do you support?',
    answer:
      'We accept major cards, Apple Pay, Google Pay, and split payments through leading buy-now-pay-later providers.',
  },
  {
    question: 'How are orders protected during shipping?',
    answer:
      'Every shipment includes real-time tracking, insured coverage, and concierge support until the package is in your hands.',
  },
  {
    question: 'Can sellers host events or livestreams on the platform?',
    answer:
      'Absolutely. Verified sellers can run livestream drops, virtual consultations, and pop-up events directly through their dashboards.',
  },
  {
    question: 'What happens if an item arrives damaged?',
    answer:
      'Reach out to support within 48 hours and we will secure a replacement or refund while managing the return logistics for you.',
  },
];

const FaqSection = () => {
  return (
    <section id="faqs" className="bg-background py-16">
      <div className="mx-auto w-[90%] max-w-7xl">
        <div className="mb-10 space-y-3 text-center lg:text-left">
          <SectionTitle title="FAQs" />
          <p className="text-sm text-muted-foreground">
            Answers to the most common questions from shoppers and sellers joining the marketplace.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Left Column */}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.slice(0, Math.ceil(faqs.length / 2)).map(({ question, answer }, index) => (
              <AccordionItem
                key={`left-${index}-${question}`}
                value={`left-item-${index}`}
                className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur transition-colors hover:border-primary/40"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                  <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Right Column */}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.slice(Math.ceil(faqs.length / 2)).map(({ question, answer }, index) => (
              <AccordionItem
                key={`right-${index}-${question}`}
                value={`right-item-${index}`}
                className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur transition-colors hover:border-primary/40"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                  <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
