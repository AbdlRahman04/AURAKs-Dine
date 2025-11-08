import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChefHat, Star, MessageSquare, Info, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface FeedbackItem {
  id: number;
  userId: string;
  orderId: number | null;
  category: string;
  message: string;
  rating: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function FeedbackManagementPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: allFeedback, isLoading } = useQuery<FeedbackItem[]>({
    queryKey: ["/api/feedback"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/feedback/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      toast({
        title: "Status Updated",
        description: "Feedback status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update feedback status.",
        variant: "destructive",
      });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "food_quality":
        return <ChefHat className="h-4 w-4" />;
      case "service":
        return <Star className="h-4 w-4" />;
      case "menu_suggestion":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
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
        return "General";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "reviewed":
        return (
          <Badge className="gap-1 bg-blue-500">
            <Eye className="h-3 w-3" />
            Reviewed
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="gap-1 bg-green-500">
            <CheckCircle2 className="h-3 w-3" />
            Resolved
          </Badge>
        );
      case "dismissed":
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3" />
            Dismissed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredFeedback = allFeedback?.filter((item) => {
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || item.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const stats = {
    total: allFeedback?.length || 0,
    pending: allFeedback?.filter((f) => f.status === "pending").length || 0,
    reviewed: allFeedback?.filter((f) => f.status === "reviewed").length || 0,
    resolved: allFeedback?.filter((f) => f.status === "resolved").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Feedback</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage customer feedback submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card data-testid="card-total-feedback">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total">{stats.total}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-pending-feedback">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-pending">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-reviewed-feedback">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-reviewed">{stats.reviewed}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-resolved-feedback">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-resolved">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food_quality">Food Quality</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="menu_suggestion">Menu Suggestion</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Submissions</CardTitle>
            <CardDescription data-testid="text-feedback-count">
              {filteredFeedback?.length || 0} feedback item(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-24 bg-muted/50 rounded-md animate-pulse" />
                ))}
              </div>
            ) : filteredFeedback && filteredFeedback.length > 0 ? (
              <div className="space-y-3">
                {filteredFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border rounded-lg p-4 space-y-3 hover-elevate"
                    data-testid={`feedback-card-${feedback.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(feedback.category)}
                            <span className="font-medium text-sm">
                              {getCategoryLabel(feedback.category)}
                            </span>
                          </div>
                          {feedback.rating && (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < feedback.rating!
                                      ? "fill-yellow-500 text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          {getStatusBadge(feedback.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {feedback.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {new Date(feedback.createdAt).toLocaleDateString()} at{" "}
                            {new Date(feedback.createdAt).toLocaleTimeString()}
                          </span>
                          {feedback.orderId && <span>Order #{feedback.orderId}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFeedback(feedback);
                            setDetailsOpen(true);
                          }}
                          data-testid={`button-view-${feedback.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {feedback.status === "pending" && (
                          <Select
                            value={feedback.status}
                            onValueChange={(status) =>
                              updateStatusMutation.mutate({ id: feedback.id, status })
                            }
                          >
                            <SelectTrigger className="w-32" data-testid={`select-status-${feedback.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No feedback submissions found
              </p>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>

      {/* Feedback Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              View complete feedback information
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryIcon(selectedFeedback.category)}
                    <span>{getCategoryLabel(selectedFeedback.category)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedFeedback.status)}</div>
                </div>
                {selectedFeedback.rating && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rating</p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < selectedFeedback.rating!
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm">
                        {selectedFeedback.rating}/5
                      </span>
                    </div>
                  </div>
                )}
                {selectedFeedback.orderId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Related Order</p>
                    <p className="mt-1">Order #{selectedFeedback.orderId}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <p className="mt-1 text-sm">
                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="mt-1 text-sm">
                    {new Date(selectedFeedback.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <p className="mt-2 p-3 bg-muted rounded-md">{selectedFeedback.message}</p>
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedFeedback.status}
                  onValueChange={(status) => {
                    updateStatusMutation.mutate(
                      { id: selectedFeedback.id, status },
                      {
                        onSuccess: () => {
                          setDetailsOpen(false);
                          setSelectedFeedback(null);
                        },
                      }
                    );
                  }}
                >
                  <SelectTrigger className="flex-1" data-testid="select-status-dialog">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Mark as Pending</SelectItem>
                    <SelectItem value="reviewed">Mark as Reviewed</SelectItem>
                    <SelectItem value="resolved">Mark as Resolved</SelectItem>
                    <SelectItem value="dismissed">Mark as Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
