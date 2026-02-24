import { useState, useEffect } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Card, CardContent, Dialog, DialogContent, DialogTrigger, Button } from "@repo/ui"
import { cn } from "@/lib/utils"
import { Maximize2 } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
  altPrefix?: string
  className?: string
}

export function ImageGallery({
  images,
  altPrefix = "Image",
  className,
}: ImageGalleryProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <Dialog>
      <div className={cn("w-full space-y-4", className)}>
        <div className="relative">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-video items-center justify-center p-0 overflow-hidden rounded-lg relative group">
                        <img
                          src={image}
                          alt={`${altPrefix} ${index + 1}`}
                          className="h-full w-full object-cover cursor-pointer"
                        />
                        <DialogTrigger asChild>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </DialogTrigger>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        </div>

        {/* Thumbnails / Pagination */}
        {images.length > 1 && (
          <div className="flex justify-start gap-2 overflow-x-auto py-2 px-1">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                  current === index + 1
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <DialogContent className="max-w-[90vw] h-[90vh] p-0 border-none bg-black/95 flex items-center justify-center">
        <Carousel className="w-full max-w-5xl" opts={{ startIndex: current - 1 }}>
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index} className="flex items-center justify-center h-[85vh]">
                <img
                  src={image}
                  alt={`${altPrefix} ${index + 1} - Full Screen`}
                  className="max-h-full max-w-full object-contain"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </DialogContent>
    </Dialog>
  )
}
