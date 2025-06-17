
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Film, LogOut, User, MessageSquare, Crown, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Account = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    email: profile?.email || '',
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSave = async () => {
    const { error } = await updateProfile({
      username: formData.username,
      email: formData.email,
    });

    if (!error) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile?.username || '',
      email: profile?.email || '',
    });
    setIsEditing(false);
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-cinema-bg text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Please sign in to view your account.</p>
          <Button 
            onClick={() => navigate('/auth')} 
            className="mt-4 bg-cinema-red hover:bg-cinema-red/90"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const messageLimit = profile.role === 'free' ? 10 : 100;
  const messageProgress = (profile.messages_today / messageLimit) * 100;

  return (
    <div className="min-h-screen bg-cinema-bg text-white">
      <div className="film-grain"></div>
      
      {/* Updated Header with Back to Chat button */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/chat')}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="relative overflow-hidden rounded-full p-0.5 bg-gradient-to-r from-cinema-red to-cinema-red/70">
                <div className="bg-black rounded-full p-1">
                  <Film className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">classic</span>
                <span className="text-cinema-red">shit.com</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Home
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <User className="w-8 h-8 text-cinema-red" />
              <h1 className="text-3xl font-bold">My Account</h1>
            </div>
            <p className="text-white/70">Manage your profile and view your usage</p>
          </div>

          <div className="space-y-6">
            {/* Profile Information */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-white/70">
                  Your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Username</Label>
                  {isEditing ? (
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  ) : (
                    <p className="text-white/80 bg-white/5 px-3 py-2 rounded-md">{profile.username}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Email</Label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      type="email"
                    />
                  ) : (
                    <p className="text-white/80 bg-white/5 px-3 py-2 rounded-md">{profile.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Account Type</Label>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-md">
                    {profile.role === 'free' ? (
                      <User className="w-4 h-4 text-white/60" />
                    ) : (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-white/80 capitalize">{profile.role}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Member Since</Label>
                  <p className="text-white/80 bg-white/5 px-3 py-2 rounded-md">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button 
                        onClick={handleSave}
                        className="bg-cinema-red hover:bg-cinema-red/90"
                      >
                        Save Changes
                      </Button>
                      <Button 
                        onClick={handleCancel}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Daily Usage
                </CardTitle>
                <CardDescription className="text-white/70">
                  Track your AI movie recommendation usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Messages used today</span>
                    <span className="text-white">{profile.messages_today} / {messageLimit}</span>
                  </div>
                  <Progress 
                    value={messageProgress} 
                    className="h-2"
                  />
                </div>
                
                {profile.role === 'free' && (
                  <div className="bg-cinema-red/10 border border-cinema-red/20 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Upgrade to Premium</h4>
                    <p className="text-white/70 text-sm mb-3">
                      Get unlimited AI movie recommendations and early access to new features.
                    </p>
                    <Button 
                      size="sm"
                      className="bg-cinema-red hover:bg-cinema-red/90"
                      onClick={() => navigate('/#waitlist')}
                    >
                      Join Waitlist
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="glass-card border-white/10">
              <CardContent className="pt-6">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
