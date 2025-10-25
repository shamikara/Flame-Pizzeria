"use client";

import { useState } from "react";
import { useSession } from "@/components/session-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Camera, Lock, UserCog, Mail, Phone, Edit } from "lucide-react";
import { ChangePasswordForm } from "./change-password-form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AccountSettingsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AccountSettingsModal({ 
  open: externalOpen, 
  onOpenChange 
}: AccountSettingsModalProps) {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  
  if (!user) return null;

  return (
    <Dialog open={externalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <UserCog className="h-6 w-6 text-orange-500" />
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Account Settings
            </DialogTitle>
          </div>
          <div className="h-px bg-gradient-to-r from-orange-500/20 to-transparent my-2" />
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-orange-400 rounded-md transition-colors"
            >
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-orange-400 rounded-md transition-colors"
            >
              <Lock className="h-4 w-4" /> Password
            </TabsTrigger>
          </TabsList>
          
          <div className="py-4">
            <TabsContent value="profile" className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden border-4 border-orange-100 dark:border-gray-700 shadow-sm">
                    {user.image ? (
                      <img 
                        src={user.image} 
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-14 w-14 text-orange-400 dark:text-orange-500" />
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute -bottom-1 -right-1 rounded-full h-9 w-9 bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-md hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors group-hover:opacity-100 opacity-0"
                    onClick={() => document.getElementById('profile-picture-upload')?.click()}
                  >
                    <Camera className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <input type="file" id="profile-picture-upload" className="hidden" accept="image/*" />
                  </Button>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                    {user.role?.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                      <Button variant="ghost" size="sm" className="h-8 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-gray-800">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Edit</span>
                      </Button>
                    </div>
                    <Input 
                      id="firstName" 
                      value={user.firstName || ""} 
                      readOnly 
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                      <Button variant="ghost" size="sm" className="h-8 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-gray-800">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Edit</span>
                      </Button>
                    </div>
                    <Input 
                      id="lastName" 
                      value={user.lastName || ""} 
                      readOnly 
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
                    <Button variant="ghost" size="sm" className="h-8 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-gray-800">
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Edit</span>
                    </Button>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      value={user.email || ""} 
                      readOnly 
                      className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                    <Button variant="ghost" size="sm" className="h-8 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-gray-800">
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Edit</span>
                    </Button>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={user.phone || ""} 
                      readOnly 
                      className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="password" className="pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Update Password</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-800">
                  <ChangePasswordForm 
                    onSuccess={() => {
                      setActiveTab('profile');
                      setTimeout(() => onOpenChange?.(false), 1000);
                    }} 
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
