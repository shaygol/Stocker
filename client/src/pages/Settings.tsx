import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, MapPin, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [location, setLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: userProfile } = trpc.user.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: stores } = trpc.user.getStoresForUserLocation.useQuery(undefined, {
    enabled: isAuthenticated && !!location,
  });

  const updateLocationMutation = trpc.user.updateLocation.useMutation({
    onSuccess: (data) => {
      setIsSaving(false);
      toast.success("Location updated successfully!");
    },
    onError: (error: any) => {
      setIsSaving(false);
      toast.error(`Failed to update location: ${error.message}`);
    },
  });

  useEffect(() => {
    if (userProfile?.location) {
      setLocation(userProfile.location);
    }
  }, [userProfile]);

  const handleSaveLocation = () => {
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }
    setIsSaving(true);
    updateLocationMutation.mutate({ location: location.trim() });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
        <div className="container max-w-2xl">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lists
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-gray-600">Please sign in to access settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="container max-w-2xl py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lists
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-600">Name</Label>
                <p className="text-lg font-semibold text-gray-900">{userProfile?.name || "Not set"}</p>
              </div>
              <div>
                <Label className="text-gray-600">Email</Label>
                <p className="text-lg font-semibold text-gray-900">{userProfile?.email || "Not set"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Location Settings
              </CardTitle>
              <CardDescription>
                Set your location to see available grocery stores and compare prices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-700 font-semibold">
                  Your Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, NY or San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-blue-300 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveLocation();
                  }}
                />
                <p className="text-sm text-gray-500">
                  Enter your city and state to find nearby grocery stores
                </p>
              </div>
              <Button
                onClick={handleSaveLocation}
                disabled={isSaving || !location.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? "Saving..." : "Save Location"}
              </Button>
            </CardContent>
          </Card>

          {/* Available Stores Card */}
          {stores && stores.length > 0 && (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-600" />
                  Available Stores in {location}
                </CardTitle>
                <CardDescription>
                  Grocery stores where you can compare prices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {stores.map((store, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white border border-green-200 hover:border-green-400 transition-colors"
                    >
                      <Store className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900">{store}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  You can now compare prices across these stores when viewing your shopping lists.
                </p>
              </CardContent>
            </Card>
          )}

          {location && (!stores || stores.length === 0) && (
            <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800">
                  No stores found for "{location}". Try entering a different city or state.
                </p>
              </CardContent>
            </Card>
          )}

          {!location && (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  Enter your location above to see available grocery stores in your area.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
