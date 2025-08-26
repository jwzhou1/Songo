'use client'

import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#8fa4f3',
      dark: '#4c63d2',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#764ba2',
      light: '#9575cd',
      dark: '#512da8',
      contrastText: '#ffffff'
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#ffffff'
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff'
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.00833em'
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0em'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.00735em'
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0em'
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.0075em'
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.00938em'
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.00714em'
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.00938em'
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01071em'
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: '0.03333em'
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase'
    }
  },
  shape: {
    borderRadius: 8
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        },
        contained: {
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        },
        elevation1: {
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
        },
        elevation2: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        },
        elevation3: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea',
              borderWidth: 2
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500
        },
        filled: {
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          color: '#667eea',
          '&:hover': {
            backgroundColor: 'rgba(102, 126, 234, 0.2)'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0 12px 12px 0',
          border: 'none'
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '1rem',
            minHeight: 48
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
          }
        }
      }
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepIcon-root': {
            color: '#e0e0e0',
            '&.Mui-active': {
              color: '#667eea'
            },
            '&.Mui-completed': {
              color: '#4caf50'
            }
          }
        }
      }
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiAlert-icon': {
            fontSize: '1.25rem'
          }
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          color: '#2e7d32',
          '& .MuiAlert-icon': {
            color: '#4caf50'
          }
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          color: '#c62828',
          '& .MuiAlert-icon': {
            color: '#f44336'
          }
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          color: '#e65100',
          '& .MuiAlert-icon': {
            color: '#ff9800'
          }
        },
        standardInfo: {
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          color: '#1565c0',
          '& .MuiAlert-icon': {
            color: '#2196f3'
          }
        }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:before': {
            display: 'none'
          },
          '&.Mui-expanded': {
            margin: '8px 0'
          }
        }
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-expanded': {
            borderRadius: '8px 8px 0 0'
          }
        }
      }
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  }
})
