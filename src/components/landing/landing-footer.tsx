
export default function LandingFooter() {
  return (
    <footer className="py-8 border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MyLifeHub. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Simplify Your Life, One Hub at a Time.
        </p>
      </div>
    </footer>
  );
}
