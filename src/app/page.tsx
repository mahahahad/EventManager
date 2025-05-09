import AuthButtons from "@/components/Auth";
import Navbar from "@/components/Navbar";
import Register from "@/components/Register";

export default function Page() {
    return (
        <div>
            <Navbar></Navbar>
            <h1>Welcome to the Event Management App! 🎉</h1>
            <Register />
        </div>
    );
}
