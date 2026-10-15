import * as React from "react";

export function buttonVariants({ variant = "default" } = {}) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    link: "text-primary underline-offset-4 hover:underline",
  };
  return [base, variants[variant] || variants.default].join(" ");
}

export const Button = React.forwardRef(function Button({ className = "", variant = "default", ...props }, ref) {
  return <button ref={ref} className={[buttonVariants({ variant }), className].join(" ")} {...props} />;
});

Button.displayName = "Button";
export default Button;

