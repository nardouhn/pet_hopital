# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Các bước để chạy
- B1:Cài đặt thư viện Nodejs: https://nodejs.org/en/download -> Mở terminal
Verify the Node.js version:
  node -v # Should print "v22.21.0".
Verify npm version:
  npm -v # Should print "10.9.4".
- B2: Tạo và vào thư mục project trống
- B3: Tạo project bằng công cụ Vite: chạy câu lệnh sau trong Terminal của project: npx create-vite
|
o  Project name:
|  .
|
o  Select a framework:
|  React
|
o  Select a variant:
|  JavaScript
|
o  Use rolldown-vite (Experimental)?:
|  No
|
o  Install with npm and start now?
|  Yes
|
o  Scaffolding project in D:\test...
|
o  Installing dependencies with npm...
added 153 packages, and audited 154 packages in 13s
32 packages are looking for funding
  run `npm fund` for details
found 0 vulnerabilities
|
o  Starting dev server...
> test@0.0.0 dev
> vite

  VITE v7.1.12  ready in 973 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

  + Ctrl + C -> y -> Enter
  + npm install 

- B4: Cài đặt Tailwindcss:
  Hướng dẫn setup: https://www.youtube.com/watch?v=xxpeaBLZNaM&list=PLt2fZkYs6q_l2WebLGr6biyk551rLUtLV&index=56 (đoạn Tailwindcss installation and configuration)
  Link tải: https://tailwindcss.com/docs/installation/using-vite
- B5: Cài đặt các gói bổ sung: npm install lucide-react react-datepicker framer-motion react-hot-toast aos
- B6: Tải và copy tất cả các file src và components
- B7: Chạy chương trình trong terminal project: npm run dev
