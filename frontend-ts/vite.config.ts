/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import type { UserConfig as VitestUserConfigInterface } from 'vitest/config';

const vitestConfig: VitestUserConfigInterface = {
  test: {
    environment: "jsdom",
    setupFiles: "./setupTests.ts",
    // speed up since tests don't rely on css
    // https://github.com/vitest-dev/vitest/blob/main/examples/react-testing-lib/vite.config.ts#L14-L16
		css: false,    
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  test: vitestConfig.test,
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000'
    },
    host: '127.0.0.1'
  },  
  plugins: [react()],
  
  // test: {
  //   globals: true,
  //   environment: "jsdom",
  //   setupFiles: "src/setupTests.ts"
  // }   
  // test: {
  //   environment: "jsdom",
  //   setupFiles: "./setupTests.ts",
  //   // speed up since tests don't rely on css
  //   // https://github.com/vitest-dev/vitest/blob/main/examples/react-testing-lib/vite.config.ts#L14-L16
	// 	css: false,
  // },     
});
