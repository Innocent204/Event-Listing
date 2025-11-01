import { ArrowLeft, Moon, Sun, User, Bell, Shield, Globe, Building, Calendar, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import React from 'react';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface OrganizerSettingsProps {
  onBack: () => void;
}

export function OrganizerSettings({ onBack }: OrganizerSettingsProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl">Organizer Settings</h1>
            <p className="text-muted-foreground">Manage your organizer profile and event preferences</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Email</label>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <label className="block mb-2">Role</label>
                  <p className="text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization
              </CardTitle>
              <CardDescription>
                Information about your organization or business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Organization Name</label>
                  <Input placeholder="Enter organization name" defaultValue="Example Events Co." />
                </div>
                <div>
                  <label className="block mb-2">Website</label>
                  <Input placeholder="https://..." defaultValue="https://example.com" />
                </div>
              </div>
              <div>
                <label className="block mb-2">Description</label>
                <Textarea 
                  placeholder="Tell people about your organization..." 
                  defaultValue="We organize amazing community events that bring people together."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Phone</label>
                  <Input placeholder="+263" defaultValue="+263" />
                </div>
                <div>
                  <label className="block mb-2">Category</label>
                  <Select defaultValue="entertainment">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="nonprofit">Non-profit</SelectItem>
                      <SelectItem value="sports">Sports & Recreation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Management Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Management
              </CardTitle>
              <CardDescription>
                Default settings for your events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block mb-1">Auto-approve RSVPs</label>
                  <p className="text-sm text-muted-foreground">Automatically accept attendee registrations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <label className="block mb-1">Allow public comments</label>
                  <p className="text-sm text-muted-foreground">Let attendees comment on your events</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <label className="block mb-1">Send reminder emails</label>
                  <p className="text-sm text-muted-foreground">Email attendees before events</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Default capacity</label>
                  <Input type="number" placeholder="100" defaultValue="100" />
                </div>
                <div>
                  <label className="block mb-2">Default price</label>
                  <Input placeholder="Free" defaultValue="Free" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how PulseCity looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block mb-1">Theme</label>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <Select value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Analytics & Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Analytics & Insights
              </CardTitle>
              <CardDescription>
                Data sharing and analytics preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block mb-1">Share event analytics</label>
                  <p className="text-sm text-muted-foreground">Help improve the platform with anonymous data</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <label className="block mb-1">Receive insights reports</label>
                  <p className="text-sm text-muted-foreground">Monthly reports about your event performance</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Control how you receive updates about your events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block mb-1">New registrations</label>
                  <p className="text-sm text-muted-foreground">When someone registers for your events</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <label className="block mb-1">Event reviews</label>
                  <p className="text-sm text-muted-foreground">When attendees leave reviews</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <label className="block mb-1">Weekly digest</label>
                  <p className="text-sm text-muted-foreground">Weekly summary of your event activity</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}