import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 font-heading font-bold text-2xl text-primary-foreground">
            RC
          </div>
          <h1 className="font-heading text-4xl font-extrabold text-primary-foreground sm:text-5xl">
            ResComplaints
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Student Residence Complaints and Maintenance System. Report issues, track progress, and keep your residence well-maintained.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/login')}
              className="rounded-lg bg-primary-foreground px-8 py-3 font-heading font-semibold text-primary shadow-lg hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="rounded-lg border-2 border-primary-foreground/30 px-8 py-3 font-heading font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              Student Sign Up
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Index;
