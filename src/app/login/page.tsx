import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/40">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">シメスくん</h1>
                <p className="text-muted-foreground">マンション書類管理システム</p>
            </div>
            <LoginForm />
        </div>
    );
}
