import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, History, Home, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const history = JSON.parse(localStorage.getItem('paddy_history') || '[]');
  const totalScans = history.length;
  const diseasesDetected = history.filter((h: any) => {
    const predicted = String(h?.predicted_class || '').toLowerCase();
    return predicted && !predicted.includes('healthy');
  }).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-2">
              <Avatar className="h-24 w-24 mx-auto border-4 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                  {user?.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl mt-4">{user?.username}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('username')}</p>
                  <p className="font-medium">{user?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">{totalScans}</p>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-destructive">{diseasesDetected}</p>
                  <p className="text-sm text-muted-foreground">Diseases Found</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/home')}
              className="h-14"
            >
              <Home className="mr-2 h-5 w-5" />
              {t('home')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/history')}
              className="h-14"
            >
              <History className="mr-2 h-5 w-5" />
              {t('history')}
            </Button>
          </div>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleLogout}
            className="w-full h-14"
          >
            <LogOut className="mr-2 h-5 w-5" />
            {t('logout')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
