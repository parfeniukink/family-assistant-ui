import { Link } from "react-router-dom";
import { prettyMoney } from "src/domain/transactions";
import { useIdentity, useEquities, useNotifications } from "src/context";
import { NoData, Card } from "src/components";
import { TOKENS } from "src/styles/tokens";

export function EquitySection() {
  const { equities } = useEquities();
  const { user } = useIdentity();
  const { openNotifications } = useNotifications();

  if (!user || !equities) {
    return <NoData />;
  } else {
    return (
      <Card
        style={{
          flexDirection: "row",
          minWidth: "35%",
          justifyContent: "space-around",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: TOKENS.SPACE_2,
          }}
        >
          {equities.map((item) => {
            return (
              <Link
                key={item.currency.id}
                to={`/finances/transactions?currencyId=${item.currency.id}`}
              >
                {user?.configuration.showEquity
                  ? `🏦 ${prettyMoney(item.amount)} ${item.currency.sign}`
                  : `x x x ${item.currency.sign}`}
              </Link>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: TOKENS.SPACE_2,
          }}
        >
          <Link to="/finances/assets">
            🏘️ assets
          </Link>
          <Link
            to="/finances/cash"
          >
            💵 cash
          </Link>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              openNotifications();
            }}
          >
            🔔 alerts
          </Link>
        </div>
      </Card>
    );
  }
}
