import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, Activity, Settings, BarChart, Plus, Edit, Trash2, Phone, Calendar, Target } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("members");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    membershipTierId: "",
    phone: "",
    emergencyContact: "",
    fitnessGoals: ""
  });
  const [newTrainer, setNewTrainer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specializations: "",
    hourlyRate: "",
    experienceYears: "",
    certifications: "",
    bio: ""
  });

  // Fetch real data
  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['/api/admin/members'],
  });

  const { data: trainers, isLoading: trainersLoading, refetch: refetchTrainers } = useQuery({
    queryKey: ['/api/admin/trainers'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: membershipTiers } = useQuery({
    queryKey: ['/api/membership-tiers'],
  });

  // Mutations
  const createMemberMutation = useMutation({
    mutationFn: (memberData: any) => apiRequest('POST', '/api/admin/create-member', memberData),
    onSuccess: () => {
      toast({
        title: "Member Created",
        description: "New member has been added successfully."
      });
      setShowAddMemberModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create member",
        variant: "destructive"
      });
    }
  });

  const createTrainerMutation = useMutation({
    mutationFn: (trainerData: any) => apiRequest('POST', '/api/admin/create-trainer', trainerData),
    onSuccess: () => {
      toast({
        title: "Trainer Added",
        description: "New trainer has been added to the team."
      });
      setShowAddTrainerModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trainers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create trainer",
        variant: "destructive"
      });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, memberData }: { id: string, memberData: any }) => apiRequest('PUT', `/api/admin/update-member/${id}`, memberData),
    onSuccess: () => {
      toast({
        title: "Member Updated",
        description: "Member details have been updated successfully."
      });
      closeModals();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update member",
        variant: "destructive",
      });
    }
  });

  const updateTrainerMutation = useMutation({
    mutationFn: ({ id, trainerData }: { id: string, trainerData: any }) => apiRequest('PUT', `/api/admin/update-trainer/${id}`, trainerData),
    onSuccess: () => {
      toast({
        title: "Trainer Updated",
        description: "Trainer details have been updated successfully."
      });
      closeModals();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trainers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update trainer",
        variant: "destructive",
      });
    }
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const memberData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone') || "",
      membershipTierId: formData.get('membershipTierId'),
      emergencyContact: formData.get('emergencyContact') || formData.get('email'),
      fitnessGoals: formData.get('fitnessGoals') || "General fitness improvement"
    };
    createMemberMutation.mutate(memberData);
  };

  const handleCreateTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const specializationsString = formData.get('specializations') as string;
    const specializations = specializationsString ? specializationsString.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];

    const trainerData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      specializations,
      hourlyRate: formData.get('hourlyRate') || "75.00",
      experienceYears: parseInt(formData.get('experienceYears') as string) || 2,
      certifications: formData.get('certifications') || "",
      bio: formData.get('bio') || ""
    };
    createTrainerMutation.mutate(trainerData);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const memberData = {
      ...newMember,
      membershipTierId: newMember.membershipTierId || (membershipTiers?.[0]?.id || "") // Default to first tier if not selected
    };

    if (editingMember) {
      updateMemberMutation.mutate({ id: editingMember.userId, memberData });
    } else {
      createMemberMutation.mutate(memberData);
    }
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    const specializations = newTrainer.specializations.split(',').map(s => s.trim()).filter(Boolean);
    const trainerData = {
      ...newTrainer,
      specializations,
      hourlyRate: newTrainer.hourlyRate || "75.00",
      experienceYears: parseInt(newTrainer.experienceYears) || 2
    };

    if (editingTrainer) {
      updateTrainerMutation.mutate({ id: editingTrainer.userId, trainerData });
    } else {
      createTrainerMutation.mutate(trainerData);
    }
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setNewMember({
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      email: member.email || "",
      membershipTierId: member.membershipTierId || "",
      phone: member.phone || "",
      emergencyContact: member.emergencyContact || "",
      fitnessGoals: member.fitnessGoals || ""
    });
    setShowAddMemberModal(true);
  };

  const handleEditTrainer = (trainer: any) => {
    setEditingTrainer(trainer);
    setNewTrainer({
      firstName: trainer.firstName || "",
      lastName: trainer.lastName || "",
      email: trainer.email || "",
      specializations: Array.isArray(trainer.specializations) ? trainer.specializations.join(', ') : "",
      hourlyRate: trainer.hourlyRate || "",
      experienceYears: trainer.experienceYears?.toString() || "",
      certifications: trainer.certifications || "",
      bio: trainer.bio || ""
    });
    setShowAddTrainerModal(true);
  };

  const handleDeleteMember = async (member: any) => {
    if (confirm(`Are you sure you want to delete member ${member.firstName} ${member.lastName}?`)) {
      try {
        const response = await fetch(`/api/admin/delete-member/${member.userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          refetchMembers();
          toast({
            title: "Success",
            description: "Member deleted successfully!",
          });
        } else {
          throw new Error('Failed to delete member');
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete member",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteTrainer = async (trainer: any) => {
    if (confirm(`Are you sure you want to delete trainer ${trainer.firstName} ${trainer.lastName}?`)) {
      try {
        const response = await fetch(`/api/admin/delete-trainer/${trainer.userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          refetchTrainers();
          toast({
            title: "Success",
            description: "Trainer deleted successfully!",
          });
        } else {
          throw new Error('Failed to delete trainer');
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete trainer",
          variant: "destructive",
        });
      }
    }
  };

  const closeModals = () => {
    setShowAddMemberModal(false);
    setShowAddTrainerModal(false);
    setEditingMember(null);
    setEditingTrainer(null);
    setNewMember({
      firstName: "",
      lastName: "",
      email: "",
      membershipTierId: "",
      phone: "",
      emergencyContact: "",
      fitnessGoals: ""
    });
    setNewTrainer({
      firstName: "",
      lastName: "",
      email: "",
      specializations: "",
      hourlyRate: "",
      experienceYears: "",
      certifications: "",
      bio: ""
    });
  };


  if (membersLoading || trainersLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-wider text-gold mb-2">ADMIN DASHBOARD</h1>
          <p className="text-gray-400">Manage your fitness center operations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Members</p>
                  <p className="text-2xl font-bold text-gold">{stats?.totalMembers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Trainers</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.totalTrainers || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-blue-400">${stats?.monthlyRevenue?.toLocaleString() || 0}</p>
                </div>
                <BarChart className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Training Sessions</p>
                  <p className="text-2xl font-bold text-purple-400">{stats?.totalSessions || 0}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-800">
            <TabsTrigger value="members" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Users className="h-4 w-4 mr-2" />
              MANAGE MEMBERS
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <BarChart className="h-4 w-4 mr-2" />
              VIEW REPORTS
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Settings className="h-4 w-4 mr-2" />
              SYSTEM SETTINGS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold">Member Management</h2>
              <div className="space-x-4">
                <Dialog open={showAddMemberModal} onOpenChange={closeModals}>
                  <DialogTrigger asChild>
                    <Button className="bg-gold text-black hover:bg-white">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingMember ? 'Edit Member' : 'Add Member'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-gold">
                        {editingMember ? 'Edit Member' : 'Add New Member'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            name="firstName"
                            className="bg-black border-gray-700 text-white"
                            required
                            value={newMember.firstName}
                            onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            name="lastName"
                            className="bg-black border-gray-700 text-white"
                            required
                            value={newMember.lastName}
                            onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          name="email"
                          type="email"
                          className="bg-black border-gray-700 text-white"
                          required
                          value={newMember.email}
                          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          name="phone"
                          className="bg-black border-gray-700 text-white"
                          value={newMember.phone}
                          onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="membershipTierId">Membership Type</Label>
                        <Select
                          name="membershipTierId"
                          required
                          value={newMember.membershipTierId}
                          onValueChange={(value) => setNewMember({...newMember, membershipTierId: value})}
                        >
                          <SelectTrigger className="bg-black border-gray-700 text-white focus:ring-gold">
                            <SelectValue placeholder="Select membership type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            {membershipTiers?.map((tier: any) => (
                              <SelectItem key={tier.id} value={tier.id} className="focus:bg-gold focus:text-black">
                                {tier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          name="emergencyContact"
                          className="bg-black border-gray-700 text-white"
                          value={newMember.emergencyContact}
                          onChange={(e) => setNewMember({...newMember, emergencyContact: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fitnessGoals">Fitness Goals</Label>
                        <Textarea
                          name="fitnessGoals"
                          placeholder="Member's fitness goals..."
                          className="bg-black border-gray-700 text-white"
                          value={newMember.fitnessGoals}
                          onChange={(e) => setNewMember({...newMember, fitnessGoals: e.target.value})}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gold text-black hover:bg-white" disabled={createMemberMutation.isPending || updateMemberMutation.isPending}>
                        {editingMember ? (createMemberMutation.isPending || updateMemberMutation.isPending ? "Updating..." : "Update Member") : (createMemberMutation.isPending ? "Creating..." : "Create Member")}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAddTrainerModal} onOpenChange={closeModals}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingTrainer ? 'Edit Trainer' : 'Add Trainer'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-gold">
                        {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddTrainer} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            name="firstName"
                            required
                            value={newTrainer.firstName}
                            onChange={(e) => setNewTrainer({...newTrainer, firstName: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            name="lastName"
                            required
                            value={newTrainer.lastName}
                            onChange={(e) => setNewTrainer({...newTrainer, lastName: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          name="email"
                          type="email"
                          required
                          value={newTrainer.email}
                          onChange={(e) => setNewTrainer({...newTrainer, email: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="specializations">Specializations</Label>
                        <Input
                          name="specializations"
                          placeholder="e.g., Strength Training, Yoga, HIIT"
                          required
                          value={newTrainer.specializations}
                          onChange={(e) => setNewTrainer({...newTrainer, specializations: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                          <Input
                            name="hourlyRate"
                            type="number"
                            step="0.01"
                            value={newTrainer.hourlyRate}
                            onChange={(e) => setNewTrainer({...newTrainer, hourlyRate: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="experienceYears">Experience (Years)</Label>
                          <Input
                            name="experienceYears"
                            type="number"
                            value={newTrainer.experienceYears}
                            onChange={(e) => setNewTrainer({...newTrainer, experienceYears: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="certifications">Certifications</Label>
                        <Textarea
                          name="certifications"
                          placeholder="Professional certifications..."
                          value={newTrainer.certifications}
                          onChange={(e) => setNewTrainer({...newTrainer, certifications: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          name="bio"
                          placeholder="Professional bio..."
                          value={newTrainer.bio}
                          onChange={(e) => setNewTrainer({...newTrainer, bio: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gold text-black hover:bg-white" disabled={createTrainerMutation.isPending || updateTrainerMutation.isPending}>
                        {editingTrainer ? (createTrainerMutation.isPending || updateTrainerMutation.isPending ? "Updating..." : "Update Trainer") : (createTrainerMutation.isPending ? "Creating..." : "Add Trainer")}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Members Table */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Current Members ({members?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Phone</TableHead>
                      <TableHead className="text-gray-400">Membership</TableHead>
                      <TableHead className="text-gray-400">Join Date</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member: any) => (
                      <TableRow key={member.userId} className="border-gray-800">
                        <TableCell className="text-white">{member.firstName} {member.lastName}</TableCell>
                        <TableCell className="text-gray-400">{member.email}</TableCell>
                        <TableCell className="text-gray-400">{member.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gold text-gold">
                            {member.membershipTier || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gold hover:bg-gold hover:text-black"
                              onClick={() => handleEditMember(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:bg-red-400 hover:text-white"
                              onClick={() => handleDeleteMember(member)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Trainers Table */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Training Staff ({trainers?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Specializations</TableHead>
                      <TableHead className="text-gray-400">Rate</TableHead>
                      <TableHead className="text-gray-400">Experience</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainers?.map((trainer: any) => (
                      <TableRow key={trainer.userId} className="border-gray-800">
                        <TableCell className="text-white">{trainer.firstName} {trainer.lastName}</TableCell>
                        <TableCell className="text-gray-400">{trainer.email}</TableCell>
                        <TableCell className="text-gray-400">
                          {trainer.specializations?.join(', ') || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-400">${trainer.hourlyRate}/hr</TableCell>
                        <TableCell className="text-gray-400">{trainer.experienceYears} years</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gold hover:bg-gold hover:text-black"
                              onClick={() => handleEditTrainer(trainer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:bg-red-400 hover:text-white"
                              onClick={() => handleDeleteTrainer(trainer)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold text-gold">Business Reports</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">This Month</span>
                      <span className="text-white font-bold">${stats?.monthlyRevenue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Growth Rate</span>
                      <span className="text-green-400 font-bold">{stats?.growth || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Subscriptions</span>
                      <span className="text-white font-bold">{stats?.activeSubscriptions || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Training Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Sessions</span>
                      <span className="text-white">{stats?.totalSessions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Trainers</span>
                      <span className="text-white">{stats?.totalTrainers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Member to Trainer Ratio</span>
                      <span className="text-white">
                        {stats?.totalMembers && stats?.totalTrainers
                          ? Math.round(stats.totalMembers / stats.totalTrainers)
                          : 0}:1
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-gold">System Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Gym Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="gymName">Gym Name</Label>
                    <Input id="gymName" value="RESHAPE FITNESS" className="bg-black border-gray-700" readOnly />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value="123 Fitness Avenue, Luxury District" className="bg-black border-gray-700" readOnly />
                  </div>
                  <div>
                    <Label htmlFor="hours">Operating Hours</Label>
                    <Input id="hours" value="5:00 AM - 11:00 PM" className="bg-black border-gray-700" readOnly />
                  </div>
                  <Button className="bg-gold text-black hover:bg-white">
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Membership Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {membershipTiers?.map((tier: any) => (
                    <div key={tier.id}>
                      <Label>{tier.name} Price</Label>
                      <Input value={`$${tier.monthlyPrice}/month`} className="bg-black border-gray-700" readOnly />
                    </div>
                  ))}
                  <Button className="bg-gold text-black hover:bg-white">
                    Update Pricing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}