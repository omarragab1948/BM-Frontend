import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';

interface BmLogoAnimationProps {
  variant?: 'hero' | 'header';
  autoPlay?: boolean;
}

export const BmLogoAnimation: React.FC<BmLogoAnimationProps> = ({
  variant = 'hero',
  autoPlay = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setIsExpanded((prev) => !prev);
    }, 2800);

    return () => clearInterval(interval);
  }, [autoPlay]);

  const isHero = variant === 'hero';

  return (
    <Box
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isHero ? '14px 24px' : '8px 16px',
          borderRadius: isHero ? '24px' : '14px',
          background: 'linear-gradient(135deg, #0095f6 0%, #d946ef 50%, #e1306c 100%)',
          boxShadow: isHero
            ? '0 12px 30px rgba(0, 149, 246, 0.4), 0 4px 15px rgba(225, 48, 108, 0.3)'
            : '0 4px 15px rgba(0, 149, 246, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          minWidth: isHero ? '110px' : '70px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isHero ? 1 : 0.6 }}>
          <Typography
            component={motion.span}
            layout
            sx={{
              fontWeight: 900,
              fontSize: isHero ? '36px' : '22px',
              color: '#ffffff',
              lineHeight: 1,
              letterSpacing: '-1px',
              fontFamily: '"Outfit", "Inter", sans-serif',
            }}
          >
            В
          </Typography>

          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.span
                key="compact-m"
                initial={{ opacity: 0, scale: 0.8, x: -5 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 5 }}
                transition={{ duration: 0.25 }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: isHero ? '36px' : '22px',
                    color: '#ffffff',
                    lineHeight: 1,
                    letterSpacing: '-1px',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                  }}
                >
                  М
                </Typography>
              </motion.span>
            ) : (
              <motion.span
                key="expanded-mire"
                initial={{ opacity: 0, width: 0, x: -10 }}
                animate={{ opacity: 1, width: 'auto', x: 0 }}
                exit={{ opacity: 0, width: 0, x: 10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: isHero ? '32px' : '20px',
                    color: '#ffffff',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  МИРЕ
                </Typography>
              </motion.span>
            )}
          </AnimatePresence>
        </Box>
      </motion.div>
    </Box>
  );
};
