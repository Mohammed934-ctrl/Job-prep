import { PricingTable as ClerkPricingTable } from "@clerk/nextjs"
import { dark } from "@clerk/themes"


export function PricingTable(){
    return <ClerkPricingTable newSubscriptionRedirectUrl="/app" appearance={dark}/>
}
