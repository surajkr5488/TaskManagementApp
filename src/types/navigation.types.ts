
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {CompositeNavigationProp} from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AppTabParamList = {
  TaskList: undefined;
  Settings: undefined;
};

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: {taskId?: string};
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
export type TaskNavigationProp = NativeStackNavigationProp<TaskStackParamList>;

