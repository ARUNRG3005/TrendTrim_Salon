import { PricingInteraction } from "./pricing-interaction";

export function PricingInteractionDemo() {
  return (
    <div className="w-full flex justify-center items-center p-8 bg-slate-50 min-h-96">
      <PricingInteraction
        starterMonth={9.99}
        starterAnnual={7.49}
        proMonth={19.99}
        proAnnual={17.49}
      />
    </div>
  );
}
