import CountUp from "react-countup";

function AnimatedCounter({ amount }: { amount: number }) {
  return (
    <CountUp
      end={amount}
      duration={1.5}
      separator=","
      decimals={2}
      prefix="$"
      style={{ fontWeight: "bold" }}
    />
  );
}
export default AnimatedCounter;
