
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Calendar, Dumbbell, Apple, Clock, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for trainer dashboard
  const trainerStats = {
    totalClients: 12,
    todaySessions: 4,
    weeklyHours: 32,
    avgRating: 4.8
  };

  const upcomingSessions = [
    { id: 1, client: "Sarah Johnson", time: "09:00 AM", type: "Strength Training", status: "Confirmed" },
    { id: 2, client: "Mike Chen", time: "11:00 AM", type: "HIIT", status: "Confirmed" },
    { id: 3, client: "Emma Davis", time: "02:00 PM", type: "Yoga", status: "Pending" },
    { id: 4, client: "David Wilson", time: "04:00 PM", type: "Cardio", status: "Confirmed" },
  ];

  const myClients = [
    { id: 1, name: "Sarah Johnson", membership: "Executive", lastSession: "2024-01-15", progress: "Excellent" },
    { id: 2, name: "Mike Chen", membership: "All Access", lastSession: "2024-01-14", progress: "Good" },
    { id: 3, name: "Emma Davis", membership: "Access", lastSession: "2024-01-13", progress: "Good" },
    { id: 4, name: "David Wilson", membership: "Executive", lastSession: "2024-01-12", progress: "Excellent" },
    { id: 5, name: "Lisa Brown", membership: "All Access", lastSession: "2024-01-11", progress: "Fair" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-wider text-gold mb-2">TRAINER DASHBOARD</h1>
          <p className="text-gray-400">Welcome back, {user?.firstName || 'Trainer'}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Clients</p>
                  <p className="text-2xl font-bold text-gold">{trainerStats.totalClients}</p>
                </div>
                <Users className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Today's Sessions</p>
                  <p className="text-2xl font-bold text-green-400">{trainerStats.todaySessions}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Weekly Hours</p>
                  <p className="text-2xl font-bold text-blue-400">{trainerStats.weeklyHours}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold text-purple-400">{trainerStats.avgRating}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Calendar className="h-4 w-4 mr-2" />
              SCHEDULE
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Users className="h-4 w-4 mr-2" />
              CLIENTS
            </TabsTrigger>
            <TabsTrigger value="workouts" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Dumbbell className="h-4 w-4 mr-2" />
              WORKOUT PLANS
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Apple className="h-4 w-4 mr-2" />
              NUTRITION
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-black rounded-lg border border-gray-800">
                        <div>
                          <p className="font-semibold text-white">{session.client}</p>
                          <p className="text-gray-400 text-sm">{session.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gold font-semibold">{session.time}</p>
                          <Badge variant={session.status === 'Confirmed' ? 'default' : 'secondary'} 
                                 className={session.status === 'Confirmed' ? 'bg-green-600' : 'bg-yellow-600'}>
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-gold text-black hover:bg-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule New Session
                  </Button>
                  <Button className="w-full bg-transparent border border-gold text-gold hover:bg-gold hover:text-black">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Create Workout Plan
                  </Button>
                  <Button className="w-full bg-transparent border border-gold text-gold hover:bg-gold hover:text-black">
                    <Apple className="h-4 w-4 mr-2" />
                    Design Nutrition Plan
                  </Button>
                  <Button className="w-full bg-transparent border border-gold text-gold hover:bg-gold hover:text-black">
                    <Users className="h-4 w-4 mr-2" />
                    View All Clients
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">My Clients ({myClients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Client Name</TableHead>
                      <TableHead className="text-gray-400">Membership</TableHead>
                      <TableHead className="text-gray-400">Last Session</TableHead>
                      <TableHead className="text-gray-400">Progress</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myClients.map((client) => (
                      <TableRow key={client.id} className="border-gray-800">
                        <TableCell className="text-white font-semibold">{client.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gold text-gold">
                            {client.membership}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">{client.lastSession}</TableCell>
                        <TableCell>
                          <Badge variant={client.progress === 'Excellent' ? 'default' : 
                                        client.progress === 'Good' ? 'secondary' : 'destructive'}
                                 className={client.progress === 'Excellent' ? 'bg-green-600' : 
                                          client.progress === 'Good' ? 'bg-blue-600' : 'bg-yellow-600'}>
                            {client.progress}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="text-gold hover:bg-gold hover:text-black">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Workout Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Dumbbell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No workout plans yet</h3>
                  <p className="text-gray-600 mb-6">Create personalized workout plans for your clients</p>
                  <Button className="bg-gold text-black hover:bg-white">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Create First Workout Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Nutrition Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Apple className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No nutrition plans yet</h3>
                  <p className="text-gray-600 mb-6">Design custom nutrition plans for your clients</p>
                  <Button className="bg-gold text-black hover:bg-white">
                    <Apple className="h-4 w-4 mr-2" />
                    Create First Nutrition Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
