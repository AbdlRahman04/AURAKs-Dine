import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare, ChefHat, Star, Info, CheckCircle2 } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

const feedbackFormSchema = z.object({
  category: z.enum(["food_quality", "service", "menu_suggestion", "general"]),
  message: z.string().min(10, "Feedback must be at least 10 characters"),
  rating: z.number().min(1).max(5).optional(),
  orderId: z.number().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

export default function FeedbackPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: recentOrders } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      category: "general",
      message: "",
      rating: undefined,
      orderId: undefined,
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      return await apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
      setTimeout(() => setShowSuccess(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/my"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    submitFeedbackMutation.mutate(data);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "food_quality":
        return <ChefHat className="h-5 w-5" />;
      case "service":
        return <Star className="h-5 w-5" />;
      case "menu_suggestion":
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "food_quality":
        return "Food Quality";
      case "service":
        return "Service";
      case "menu_suggestion":
        return "Menu Suggestion";
      default:
        return "General Feedback";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Share Your Feedback</h1>
          <p className="text-muted-foreground mt-2">
            Help us improve your cafeteria experience
          </p>
        </div>

        {showSuccess && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Thank you for your feedback!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    We appreciate your input and will review it soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
            <CardDescription>
              Tell us about your experience or suggest new menu items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback Category</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedCategory(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-feedback-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="food_quality">
                            <div className="flex items-center gap-2">
                              <ChefHat className="h-4 w-4" />
                              <span>Food Quality</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="service">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              <span>Service</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="menu_suggestion">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              <span>Menu Suggestion</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="general">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              <span>General Feedback</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(selectedCategory === "food_quality" || selectedCategory === "service") && (
                  <FormField
                    control={form.control}
                    name="orderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Order (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-order">
                              <SelectValue placeholder="Select an order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {recentOrders?.slice(0, 10).map((order) => (
                              <SelectItem key={order.id} value={order.id.toString()}>
                                Order #{order.orderNumber} - {new Date(order.createdAt).toLocaleDateString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select a recent order if this feedback is related to a specific order
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(selectedCategory === "food_quality" || selectedCategory === "service") && (
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (Optional)</FormLabel>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              type="button"
                              variant={field.value === rating ? "default" : "outline"}
                              size="icon"
                              onClick={() => field.onChange(rating)}
                              data-testid={`button-rating-${rating}`}
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  field.value && field.value >= rating
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                            </Button>
                          ))}
                        </div>
                        <FormDescription>
                          Rate your experience from 1 to 5 stars
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Feedback</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={
                            selectedCategory === "menu_suggestion"
                              ? "Tell us what you'd like to see on the menu..."
                              : "Share your thoughts and suggestions..."
                          }
                          className="min-h-[150px] resize-none"
                          data-testid="textarea-feedback"
                        />
                      </FormControl>
                      <FormDescription>
                        Please provide detailed feedback (minimum 10 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitFeedbackMutation.isPending}
                  data-testid="button-submit-feedback"
                >
                  {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Previous Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <MyFeedbackList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MyFeedbackList() {
  const { data: myFeedback, isLoading } = useQuery({
    queryKey: ["/api/feedback/my"],
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted/50 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (!myFeedback || myFeedback.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        You haven't submitted any feedback yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {myFeedback.map((feedback: any) => (
        <div
          key={feedback.id}
          className="border rounded-md p-4 space-y-2"
          data-testid={`feedback-item-${feedback.id}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {feedback.category.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </span>
              {feedback.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  <span className="text-xs">{feedback.rating}/5</span>
                </div>
              )}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                feedback.status === "resolved"
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : feedback.status === "reviewed"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {feedback.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{feedback.message}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(feedback.createdAt).toLocaleDateString()} at{" "}
            {new Date(feedback.createdAt).toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );
}
