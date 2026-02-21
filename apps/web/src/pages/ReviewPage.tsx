import { ReviewForm } from '@/components/reviews/ReviewForm';
import { useFeaturedReviews } from '@/hooks/queries/useReviews';
import { Avatar, AvatarFallback, Card, CardContent, CardHeader, CardTitle, Badge } from '@repo/ui';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReviewPage() {
  const { data: featuredReviews, isLoading } = useFeaturedReviews();

  return (
    <div className="min-h-screen bg-background py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-1 gap-12 items-start">
          {/* Review Form Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                Share Your Experience
              </h1>
              <p className="text-muted-foreground text-sm">
                Your feedback helps us improve and deliver better software solutions.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewForm />
              </CardContent>
            </Card>
          </div>

          {/* Featured Reviews Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                What Others Are Saying
              </h2>
              <p className="text-muted-foreground text-sm">
                See what our community has to say about our solutions.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-32" />
                  </Card>
                ))}
              </div>
            ) : featuredReviews?.length > 0 ? (
              <div className="space-y-4">
                {featuredReviews.map((review: any) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {review.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="font-semibold">{review.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {review.position && review.company
                                ? `${review.position} at ${review.company}`
                                : review.company || review.position || 'Verified User'}
                            </p>
                          </div>
                          <div className="ml-auto flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 relative">
                          <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary/10 rotate-180" />
                          <p className="text-muted-foreground pl-6 relative z-10 italic">
                            "{review.content}"
                          </p>
                        </div>
                        {review.type === 'app-specific' && (
                          <div className="mt-4 pt-4 border-t">
                            <Badge variant="outline" className="text-xs">
                              App Review
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                <p>No featured reviews yet. Be the first to be featured!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
