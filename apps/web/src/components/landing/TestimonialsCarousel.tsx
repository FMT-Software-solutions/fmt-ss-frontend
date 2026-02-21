import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui';
import { Quote, Star } from 'lucide-react';
import { useTestimonials } from '@/hooks/queries/useTestimonials';

interface TestimonialsCarouselProps {
  title?: string;
  subtitle?: string;
  autoplaySpeed?: number;
  className?: string;
}

export function TestimonialsCarousel({
  title = 'What our clients say',
  subtitle = 'From startups to enterprises, businesses trust us to deliver exceptional software solutions that drive growth and innovation.',
  autoplaySpeed = 3000,
  className,
}: TestimonialsCarouselProps) {
  const { data: testimonials = [], isLoading } = useTestimonials();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplaySpeed);

    return () => {
      clearInterval(autoplay);
    };
  }, [emblaApi, autoplaySpeed]);

  if (isLoading) {
    return null; // Or a skeleton loader
  }

  // "if there are no records, that section should not show"
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-20 bg-muted/50 overflow-hidden', className)}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            {title}
          </h2>
          <p className="text-sm/relaxed max-w-105 text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto" ref={emblaRef}>
          <div className="flex justify-center -ml-4">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="pl-4 flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0"
              >
                <div className="h-full p-6 rounded-xl bg-background border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col mx-2">
                  <div className="flex justify-between items-start mb-4">
                    <Quote className="w-8 h-8 text-primary/20" />
                    {testimonial.rating && (
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < (testimonial.rating || 0) ? 'fill-primary text-primary' : 'text-muted-foreground/20'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-6 grow leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t">
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                      {testimonial.imageSrc && (
                        <AvatarImage
                          src={testimonial.imageSrc}
                          alt={testimonial.name}
                        />
                      )}
                      <AvatarFallback className="bg-primary/5 text-primary">
                        {testimonial.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {testimonial.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {testimonial.role && (
                          <span className="text-xs text-muted-foreground">
                            {testimonial.role}
                          </span>
                        )}
                        {testimonial.username && (
                          <span className="text-[10px] text-primary/60 font-medium bg-primary/5 px-1.5 py-0.5 rounded-full">
                            {testimonial.username}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
