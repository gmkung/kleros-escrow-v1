import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Token, tokenService } from "@/lib/tokens";

interface TokenSelectorProps {
  value?: Token;
  onSelect: (token: Token) => void;
  disabled?: boolean;
  className?: string;
}

export function TokenSelector({ value, onSelect, disabled, className }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const tokens = tokenService.getAllTokens();

  const selectedToken = value || tokenService.getDefaultToken();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            {selectedToken.logoURI && (
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                className="w-5 h-5 rounded-full"
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <span className="font-medium">{selectedToken.symbol}</span>
            <span className="text-muted-foreground text-sm">
              {selectedToken.name}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search tokens..." className="h-9" />
          <CommandList>
            <CommandEmpty>No token found.</CommandEmpty>
            <CommandGroup>
              {tokens.map((token) => (
                <CommandItem
                  key={token.address}
                  value={`${token.symbol} ${token.name}`}
                  onSelect={() => {
                    onSelect(token);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    {token.logoURI && (
                      <img
                        src={token.logoURI}
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{token.symbol}</span>
                        {token.isNative && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                            Native
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {token.name}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{token.decimals} decimals</div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedToken.address === token.address ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default TokenSelector; 