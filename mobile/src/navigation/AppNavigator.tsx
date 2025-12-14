import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import AuthLoadingScreen from "../screens/AuthLoadingScreen"; // ✅ FIXED
import EditProfileScreen from "../screens/EditProfileScreen";
import MarketplaceScreen from "../screens/MarketplaceScreen";
import SplashScreen from "../components/SplashScreen";
import NotificationsScreen from "../screens/NotificationsScreen"; // ✅ FIXED
import Events from "../screens/EventsScreen";
import MessageScreen from "../screens/MessageScreen";
import Friends from "../screens/FriendScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import OnboardingHubScreen from "../screens/OnboardingHubScreen"
import IdentityVerification from "../screens/IdentityVerificationScreen";
import VerificationSuccessScreen from "../screens/VerificationSuccessScreen";
import OrientationScreen from "../screens/OrientationScreen";
import ApplicationFormScreen from "../screens/ApplicationFormScreen";
import FinalReviewScreen from "../screens/FinalReviewScreen";
import ApplicationReviewPendingScreen from "../screens/ApplicationReviewPendingScreen";
import ApprovalScreen from "../screens/ApprovalScreen";
import CoopPreDashboardScreen from "../screens/CoopPreDashboardScreen"
import CoopDashboardScreen from "../screens/CoopDashboardScreen";
import SocialScreen from "../screens/SocialScreen";
import StepRestoreLoader from "../components/StepRestoreLoader";
import ResetPasswordScreen from "../screens/ResetPassword";
import SavingsScreen from "../screens/CoopScreens/SavingsScreen";
import MemberScreen from "../screens/CoopScreens/MembersScreen";
import AddSavingsScreen from "../screens/CoopScreens/AddSavingsScreen";
import LoanScreen from "../screens/CoopScreens/LoanScreen";
import PerformanceScreen from "../screens/CoopScreens/PerformanceScreen";
import AnnouncementScreen from "../screens/CoopScreens/AnnouncementScreen";
import GovEventsScreen from "../screens/CoopScreens/GoveventsScreen";

export type RootStackParamList = {
  
  Splash: undefined;
  AuthLoading: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword:undefined;
  Home: undefined;
  EditProfile: undefined;
  Menu: undefined;
  Bayanihan: undefined;
  Marketplace: undefined;
  NotificationsScreen: { openChat?: { userId: string; userName: string } } | undefined;
  Friends: undefined;
  MessageScreen: { userId?: string | Number; userName?: string };
  Events: undefined;
  OnboardingHub : undefined;
  IdentityVerification : undefined;
  Verification : undefined;
  Orientation : undefined;
  Application : undefined;
  FinalReview : undefined;
  ApplicationReviewPending : undefined;
  Approval : undefined;
  CoopPreDashboard : undefined;
  CoopDashboard : undefined;
  Social : undefined;
  StepRestoreLoader: undefined;
  ResetPassword :  { email: string } | undefined;
  //COOP SCREENS
  Savings : undefined;
  viewmembers : undefined;
  AddSavings : undefined;
  Loan : undefined;
  Performance : undefined;
  Announcement : undefined;
  GovEvents : undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false}}>
        <Stack.Screen name="StepRestoreLoader" component={StepRestoreLoader} />
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Social" component={SocialScreen} />
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false, animation: "slide_from_right", }} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{headerShown: false}}/>
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
        <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} options={{ title: "Notifications" }}/>
        <Stack.Screen name="Events" component={Events} />
        <Stack.Screen name="OnboardingHub" component={OnboardingHubScreen} options={{ headerShown: false }} />
        <Stack.Screen name="IdentityVerification" component={IdentityVerification} />
        <Stack.Screen name="Verification" component={VerificationSuccessScreen} />
        <Stack.Screen name="Orientation" component={OrientationScreen} />
        <Stack.Screen name="Application" component={ApplicationFormScreen} />
        <Stack.Screen name="FinalReview" component={FinalReviewScreen} />
        <Stack.Screen name="ApplicationReviewPending" component={ApplicationReviewPendingScreen} />
        <Stack.Screen name="Approval" component={ApprovalScreen} />
        <Stack.Screen name="CoopPreDashboard" component={CoopPreDashboardScreen} />
        <Stack.Screen name="CoopDashboard" component={CoopDashboardScreen} />
        <Stack.Screen name="MessageScreen" component={MessageScreen} options={{ title: "Messages" }} />
        <Stack.Screen name="Friends" component={Friends} />
        <Stack.Screen name="Savings" component={SavingsScreen} options={{headerShown: false}}/>
        <Stack.Screen name="viewmembers" component={MemberScreen} options={{headerShown: false}}/>
        <Stack.Screen name="AddSavings" component={AddSavingsScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Loan" component={LoanScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Performance" component={PerformanceScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Announcement" component={AnnouncementScreen} options={{headerShown: false}}/>
        <Stack.Screen name="GovEvents" component={GovEventsScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
  );
}
