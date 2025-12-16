import { loginUser } from "../authSlice";

function UserProfile() {
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );
}

export default UserProfile;
