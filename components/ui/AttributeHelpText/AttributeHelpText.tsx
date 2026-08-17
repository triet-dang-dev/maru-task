"use client";

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { HelpCircle } from "lucide-react";

interface AttributeHelpTextProps {
  text: string;
}

export function AttributeHelpText({ text }: AttributeHelpTextProps) {
  return (
    <Tooltip arrow placement="top" title={text}>
      <Box
        aria-label={`Help: ${text}`}
        className="op-attribute-help-text inline-flex items-center text-slate-400 hover:text-slate-600 transition-colors"
        component="span"
        sx={{ cursor: "help", display: "inline-flex", ml: 0.75, verticalAlign: "middle" }}
        tabIndex={0}
      >
        <HelpCircle aria-hidden="true" size={13} strokeWidth={2} />
      </Box>
    </Tooltip>
  );
}
