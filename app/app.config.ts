export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      secondary: 'slate',
      success: 'emerald',
      info: 'sky',
      warning: 'amber',
      error: 'rose',
      neutral: 'slate'
    },

    button: {
      slots: {
        base: [
          'rounded-xl font-medium inline-flex items-center justify-center gap-2',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'cursor-pointer'
        ].join(' ')
      },
      defaultVariants: {
        size: 'md',
        color: 'primary',
        variant: 'solid'
      },
      variants: {
        size: {
          xs: { base: 'px-2.5 py-1 text-xs gap-1' },
          sm: { base: 'px-3 py-1.5 text-sm gap-1.5' },
          md: { base: 'px-4 py-2 text-sm gap-2' },
          lg: { base: 'px-5 py-2.5 text-base gap-2' },
          xl: { base: 'px-6 py-3 text-base gap-2.5' }
        }
      }
    },

    input: {
      slots: {
        root: 'relative inline-flex items-center w-full',
        base: [
          'w-full rounded-xl bg-white dark:bg-slate-900',
          'text-slate-900 dark:text-slate-100',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'border border-slate-200 dark:border-slate-700',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        ].join(' ')
      },
      defaultVariants: {
        size: 'md',
        color: 'primary',
        variant: 'outline'
      }
    },

    textarea: {
      slots: {
        base: [
          'w-full rounded-xl bg-white dark:bg-slate-900',
          'text-slate-900 dark:text-slate-100',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'border border-slate-200 dark:border-slate-700',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        ].join(' ')
      },
      defaultVariants: {
        size: 'md',
        color: 'primary',
        variant: 'outline'
      }
    },

    select: {
      slots: {
        base: [
          'w-full rounded-xl bg-white dark:bg-slate-900',
          'text-slate-900 dark:text-slate-100',
          'border border-slate-200 dark:border-slate-700',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500'
        ].join(' ')
      },
      defaultVariants: {
        size: 'md',
        color: 'primary',
        variant: 'outline'
      }
    },

    selectMenu: {
      slots: {
        content: 'rounded-xl shadow-lifted border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden',
        item: 'rounded-lg transition-colors duration-150'
      }
    },

    card: {
      slots: {
        root: [
          'rounded-2xl bg-white dark:bg-slate-900',
          'border border-slate-200/80 dark:border-slate-800',
          'shadow-soft overflow-hidden',
          'transition-shadow duration-200'
        ].join(' '),
        header: 'px-5 py-4 sm:px-6 border-b border-slate-100 dark:border-slate-800',
        body: 'px-5 py-4 sm:px-6',
        footer: 'px-5 py-4 sm:px-6 border-t border-slate-100 dark:border-slate-800'
      }
    },

    modal: {
      slots: {
        overlay: 'bg-slate-950/50 backdrop-blur-sm',
        content: 'rounded-2xl shadow-lifted border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800',
        header: 'px-5 py-4 sm:px-6',
        body: 'px-5 py-4 sm:px-6',
        footer: 'px-5 py-4 sm:px-6'
      }
    },

    slideover: {
      slots: {
        overlay: 'bg-slate-950/50 backdrop-blur-sm',
        content: 'bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-lifted',
        header: 'px-5 py-4 sm:px-6 border-b border-slate-100 dark:border-slate-800',
        body: 'px-5 py-4 sm:px-6',
        footer: 'px-5 py-4 sm:px-6 border-t border-slate-100 dark:border-slate-800'
      }
    },

    dropdownMenu: {
      slots: {
        content: 'rounded-xl shadow-lifted border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5',
        item: 'rounded-lg transition-colors duration-150'
      }
    },

    badge: {
      slots: {
        base: 'rounded-full font-medium inline-flex items-center gap-1 transition-colors duration-150'
      },
      defaultVariants: {
        size: 'sm',
        color: 'primary',
        variant: 'subtle'
      }
    },

    alert: {
      slots: {
        root: 'rounded-xl border shadow-soft',
        title: 'font-semibold',
        description: 'text-sm opacity-90'
      }
    },

    tooltip: {
      slots: {
        content: 'rounded-lg shadow-soft text-xs px-2.5 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
      }
    },

    tabs: {
      slots: {
        list: 'rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 gap-1',
        trigger: [
          'rounded-lg font-medium transition-all duration-200',
          'data-[state=active]:bg-white data-[state=active]:shadow-soft',
          'dark:data-[state=active]:bg-slate-900'
        ].join(' '),
        content: 'mt-4 focus:outline-none'
      }
    },

    table: {
      slots: {
        root: 'relative overflow-auto',
        base: 'min-w-full table-fixed border-separate border-spacing-0',
        thead: 'bg-slate-50/80 dark:bg-slate-900/50',
        tbody: 'divide-y divide-slate-100 dark:divide-slate-800',
        th: 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400',
        td: 'px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300'
      }
    },

    breadcrumb: {
      slots: {
        link: 'text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors duration-150',
        separatorIcon: 'text-slate-300 dark:text-slate-600 size-4'
      }
    },

    navigationMenu: {
      slots: {
        link: [
          'rounded-xl transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
        ].join(' ')
      }
    },

    formField: {
      slots: {
        label: 'text-sm font-medium text-slate-700 dark:text-slate-300',
        description: 'text-xs text-slate-500 dark:text-slate-400',
        error: 'text-xs text-rose-600 dark:text-rose-400',
        hint: 'text-xs text-slate-400'
      }
    },

    checkbox: {
      slots: {
        base: 'rounded-md transition-colors duration-150'
      }
    },

    switch: {
      slots: {
        base: 'transition-colors duration-200'
      }
    },

    avatar: {
      slots: {
        root: 'rounded-full ring-2 ring-white dark:ring-slate-900'
      }
    },

    skeleton: {
      slots: {
        base: 'rounded-xl bg-slate-200/80 dark:bg-slate-800 animate-pulse'
      },
      base: 'rounded-xl bg-slate-200/80 dark:bg-slate-800 animate-pulse'
    },

    pagination: {
      slots: {
        list: 'gap-1',
        item: 'rounded-lg transition-colors duration-150'
      }
    },

    toast: {
      slots: {
        root: 'rounded-xl shadow-lifted border border-slate-200 dark:border-slate-700 backdrop-blur-md'
      }
    },

    separator: {
      slots: {
        border: 'border-slate-200 dark:border-slate-800'
      }
    },

    popover: {
      slots: {
        content: 'rounded-xl shadow-lifted border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3'
      }
    },

    commandPalette: {
      slots: {
        root: 'rounded-2xl shadow-lifted border border-slate-200 dark:border-slate-700 overflow-hidden',
        input: 'border-0 focus:ring-0',
        item: 'rounded-lg transition-colors duration-150'
      }
    },

    container: {
      base: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    }
  },

  app: {
    name: 'CommerceOS',
    tagline: 'Tu tienda, elevada.',
    description: 'Plantilla ecommerce premium con panel admin y experiencia de compra moderna.'
  }
})
