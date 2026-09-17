import { define, STORE_NAME } from "../../lib/utils.ts";
import { Head, Partial } from "fresh/runtime";
import TrackRepairIsland from "./(_islands)/TrackRepairIsland.tsx";
import { page } from "fresh";

export const handler = define.handlers({
  GET(ctx) {
    const backendUrl = Deno.env.get("MEDUSA_BACKEND_URL")!;
    const publishableKey = Deno.env.get("MEDUSA_PUBLISHABLE_KEY") || "";
    const paystackPublicKey = Deno.env.get("PAYSTACK_PUBLIC_KEY") || "";
    const isLoggedIn = Boolean((ctx.state as any).isLoggedIn);

    return page({ backendUrl, publishableKey, paystackPublicKey, isLoggedIn });
  },
});

export default define.page(function TrackRepairRoute(props) {
  const { backendUrl, publishableKey, paystackPublicKey, isLoggedIn } = props.data;
  const token = props.url.searchParams.get("token") || "";
  const ticket = props.url.searchParams.get("ticket") ||
    props.url.searchParams.get("serial") || "";
  const action = props.url.searchParams.get("action") || "";

  console.debug(
    `[TrackRepairRoute] Rendered with backendUrl: ${backendUrl}, isLoggedIn: ${isLoggedIn}`,
  );

  return (
    <>
      <Head>
        <title>Track Your Repair | {STORE_NAME}</title>
        <meta
          name="description"
          content="Track your device repair ticket status."
        />
        <meta
          property="og:title"
          content={`Track Your Repair | ${STORE_NAME}`}
        />
        <meta
          property="og:description"
          content="Track your device repair ticket status."
        />
        <meta name="view-transition" content="same-origin" />
        <script src="https://js.paystack.co/v1/inline.js"></script>
      </Head>
      <Partial name="repair-content">
        <div class="route-container" f-client-nav>
          <div>
            <TrackRepairIsland
              backendUrl={backendUrl}
              initialToken={token}
              initialTicket={ticket}
              initialAction={action}
              publishableApiKey={publishableKey}
              paystackPublicKey={paystackPublicKey}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>
      </Partial>
    </>
  );
});
