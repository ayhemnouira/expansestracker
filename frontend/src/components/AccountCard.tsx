import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import type { Account } from "../types";
import paypassUrl from "../assets/Paypass.svg?url";
import mastercardUrl from "../assets/mastercard.svg?url";
import linesUrl from "../assets/lines.png?url";

interface AccountCardProps {
  account: Account;
  userName: string;
  onToggleEnabled: (accountId: string, enabled: boolean) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  userName,
  onToggleEnabled,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // 🎨 BankCard-style gradients (matching BankCard design)
  const leftBrightStart = account.enabled ? "#A1E3F9" : "#E0E0E0"; // very light aqua blue or gray when disabled
  const leftBrightEnd = account.enabled ? "#4FC1DB" : "#B0B0B0"; // seaSerpent or gray when disabled

  // 🎨 Darker right gradient
  const rightDarkStart = account.enabled ? "#3B556E" : "#666666"; // policeBlue or gray when disabled
  const rightDarkEnd = account.enabled ? "#243545" : "#444444"; // deeper navy or gray when disabled

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent toggle when clicking on the switch itself
    if ((event.target as HTMLElement).closest(".MuiSwitch-root")) {
      return;
    }
    // Toggle the account enabled state
    onToggleEnabled(account.id, !account.enabled);
  };

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleEnabled(account.id, event.target.checked);
  };

  return (
    <Box display="flex" flexDirection="column" width="100%" position="relative">
      <Card
        onClick={handleCardClick}
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 320,
          height: 190,
          borderRadius: "20px",
          border: `1px solid #ffffff`,
          boxShadow: theme.shadows[6],
          overflow: "hidden",
          backdropFilter: "blur(6px)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-8px) scale(1.02)",
            boxShadow: `0 20px 40px ${colors.primary[900]}40, 0 0 20px ${colors.greenAccent[500]}20`,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, transparent 30%, ${colors.greenAccent[500]}10 50%, transparent 70%)`,
            opacity: 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          },
          "&:hover::before": {
            opacity: 1,
          },
        }}
      >
        {/* Left content panel */}
        <CardContent
          sx={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            maxWidth: 300,
            borderTopLeftRadius: "20px",
            borderBottomLeftRadius: "20px",
            backgroundImage: `linear-gradient(160deg, ${leftBrightStart} 0%, ${leftBrightEnd} 100%)`,
            px: 2.5,
            pt: 2.5,
            pb: 2,
          }}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: "#ffffff", fontSize: 16 }}
              >
                {account.name}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              fontWeight={900}
              sx={{
                color: account.enabled ? "#ffffff" : colors.grey[600],
                fontSize: 20,
                fontFamily: "IBM Plex Serif, serif",
              }}
            >
              ${account.currentBalance.toLocaleString()}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{
                  color: account.enabled ? "#ffffff" : colors.grey[600],
                  fontSize: 12,
                }}
              >
                {userName}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{
                  color: account.enabled ? "#ffffff" : colors.grey[600],
                  fontSize: 12,
                }}
              >
                ●● / ●●
              </Typography>
            </Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              letterSpacing={1.1}
              sx={{
                color: account.enabled ? "#ffffff" : colors.grey[600],
                fontSize: 14,
              }}
            >
              ●●●● ●●●● ●●●●{" "}
              <Box component="span" sx={{ fontSize: 16 }}>
                {account.mask}
              </Box>
            </Typography>
          </Box>
        </CardContent>

        {/* Right icon panel */}
        <Box
          sx={{
            position: "relative",
            zIndex: 10,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTopRightRadius: "20px",
            borderBottomRightRadius: "20px",
            backgroundImage: `linear-gradient(135deg, ${rightDarkStart} 0%, ${rightDarkEnd} 100%)`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
            pr: 2.5,
            py: 2.5,
          }}
        >
          <Box
            component="img"
            src={paypassUrl}
            alt="pay"
            sx={{ width: 20, height: 24 }}
          />
          {/* Middle lines image inside right panel */}
          <Box
            sx={{
              flexGrow: 1,
              alignSelf: "stretch",
              backgroundImage: `url(${linesUrl})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "contain",
            }}
          />
          <Box
            component="img"
            src={mastercardUrl}
            alt="mastercard"
            sx={{
              width: 45,
              height: 32,
              ml: 2,
              opacity: account.enabled ? 1 : 0.5,
              transition: "all 0.3s ease",
              filter: account.enabled
                ? "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                : "none",
              animation: account.enabled
                ? "subtlePulse 3s ease-in-out infinite"
                : "none",
              "@keyframes subtlePulse": {
                "0%, 100%": {
                  transform: "scale(1)",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                },
                "50%": {
                  transform: "scale(1.05)",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                },
              },
            }}
          />
        </Box>
      </Card>

      {/* Enable/Disable Toggle */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt={2}
        p={1}
        sx={{
          backgroundColor:
            theme.palette.mode === "dark"
              ? colors.primary[500]
              : colors.grey[100],
          borderRadius: "8px",
          border: `1px solid ${
            theme.palette.mode === "dark"
              ? colors.primary[400]
              : colors.grey[300]
          }`,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? colors.primary[400]
                : colors.grey[200],
          },
        }}
      >
        <Typography
          variant="body2"
          color={
            theme.palette.mode === "dark" ? colors.grey[100] : colors.grey[900]
          }
        >
          {account.enabled ? "Account Enabled" : "Account Disabled"}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={account.enabled || false}
              onChange={handleToggle}
              color="success"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: colors.greenAccent[600],
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: colors.greenAccent[600],
                },
              }}
            />
          }
          label=""
        />
      </Box>

      {/* Account Details */}
      <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
        <Typography variant="caption" color={colors.grey[300]}>
          Type: {account.type} • Subtype: {account.subtype}
        </Typography>
        <Typography variant="caption" color={colors.grey[300]}>
          Available: ${account.availableBalance.toLocaleString()}
        </Typography>
        <Typography variant="caption" color={colors.grey[300]}>
          Institution: {account.institutionId}
        </Typography>
      </Box>
    </Box>
  );
};

export default AccountCard;
