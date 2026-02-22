import { motion } from 'framer-motion';
import { Button } from '@repo/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@repo/ui';
import { Link } from 'react-router-dom';
import { urlFor } from '@/lib/sanity';
import type { IPremiumAppListItem } from '@/types/premium-app';
import { useFeaturedApps } from '@/hooks/queries/useFeaturedApps';

export function FeaturedApps() {
  const { data: apps = [], isLoading, error } = useFeaturedApps();

  console.log('apps', apps);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl max-w-90 sm:max-w-150">Software Solutions That Fit Your Business Needs</h2>
        </div>

        {error && (
          <div className="text-center py-4 mb-8 bg-destructive/10 text-destructive rounded-md">
            Failed to load apps. Something went wrong, try again later!.
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <Card key={index} className="h-112.5 flex flex-col animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent className="grow">
                  <div className="aspect-video bg-muted rounded mb-4"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {apps.map((app, index) => (
                <PremiumAppCard key={app._id} app={app} index={index} />
              ))}
            </div>
            <div className="flex justify-center">
              <Button asChild size="lg">
                <Link to="/marketplace">View All Apps</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function PremiumAppCard({
  app,
  index,
}: {
  app: IPremiumAppListItem;
  index: number;
}) {
  const { title, slug, mainImage, shortDescription, sectors, promotion, price } = app;

  const finalPrice = promotion?.hasPromotion && promotion?.isActive && promotion?.discountPrice
    ? promotion.discountPrice
    : price;



  const imageUrl = urlFor(mainImage)?.url() || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="line-clamp-1 text-xl">{title}</CardTitle>
            {promotion?.hasPromotion && promotion?.isActive && (
              <Badge className="bg-green-600 hover:bg-green-700 shrink-0">Promo</Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2 h-10">{shortDescription}</CardDescription>
        </CardHeader>
        <CardContent className="grow flex flex-col">
          <div className="aspect-video relative rounded-lg overflow-hidden mb-4 bg-muted">
            <img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="mt-auto pt-4 flex justify-between items-center">
            {sectors && sectors.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {sectors.slice(0, 2).map((sector, i) => (
                  <Badge key={sector + i} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
                {sectors.length > 2 && <Badge variant="secondary" className="text-xs">+{sectors.length - 2}</Badge>}
              </div>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <span className="font-semibold whitespace-nowrap">GHS {finalPrice}</span>
              <Button variant="secondary" size="sm" asChild>
                <Link to={`/marketplace/${slug.current}`}>View</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
