import { useState } from 'react';
import { Button, Input, Textarea, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@repo/ui';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateReview } from '@/hooks/queries/useReviews';
import { useAllApps } from '@/hooks/queries/useAllApps';

interface ReviewFormProps {
  appId?: string;
  appName?: string;
  isPopup?: boolean;
  onSuccess?: () => void;
  className?: string;
}

export function ReviewForm({ appId, appName, isPopup = false, onSuccess, className = '' }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewType, setReviewType] = useState<'general' | 'app-specific'>(appId ? 'app-specific' : 'general');
  const [selectedAppId, setSelectedAppId] = useState<string>(appId || '');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '',
    company: '',
    position: '',
  });

  const { mutate: submitReview, isPending } = useCreateReview();
  const { data: allApps, isLoading: isLoadingApps } = useAllApps();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (reviewType === 'app-specific' && !selectedAppId) {
      toast.error('Please select an app');
      return;
    }

    submitReview(
      {
        ...formData,
        rating,
        type: reviewType,
        app_id: reviewType === 'app-specific' ? selectedAppId : undefined,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          setFormData({ name: '', email: '', content: '', company: '', position: '' });
          setRating(0);
          if (!appId) {
            setReviewType('general');
            setSelectedAppId('');
          }
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        {!appId && (
          <div className="space-y-2">
            <Label>Review Type</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={reviewType === 'general' ? 'default' : 'outline'}
                onClick={() => setReviewType('general')}
                className="flex-1"
              >
                General Review
              </Button>
              <Button
                type="button"
                variant={reviewType === 'app-specific' ? 'default' : 'outline'}
                onClick={() => setReviewType('app-specific')}
                className="flex-1"
              >
                App Specific
              </Button>
            </div>

            {reviewType === 'app-specific' && (
              <div className="mt-4">
                <Label>Select App</Label>
                <Select
                  value={selectedAppId}
                  onValueChange={setSelectedAppId}
                  disabled={isLoadingApps}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingApps ? "Loading apps..." : "Select an app"} />
                  </SelectTrigger>
                  <SelectContent>
                    {allApps?.map((app) => (
                      <SelectItem key={app._id} value={app._id}>
                        {app.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 ${star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                    }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        {!isPopup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position (Optional)</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="content">Review</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder={
              appId
                ? `Tell us what you think about ${appName || 'this app'}...`
                : "Tell us about your experience with FMT Software Solutions..."
            }
            className="min-h-30"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
