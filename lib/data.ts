export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  accent: string;
};

export const products: Product[] = [
  { id: "p1", sku: "CAF-001", name: "Café coado", category: "Bebidas", price: 6.5, stock: 42, accent: "#f8d7a8" },
  { id: "p2", sku: "SAL-014", name: "Pão de queijo", category: "Lanches", price: 8.9, stock: 28, accent: "#f4b183" },
  { id: "p3", sku: "DOC-021", name: "Brownie artesanal", category: "Doces", price: 12.0, stock: 16, accent: "#c99a73" },
  { id: "p4", sku: "BEB-008", name: "Suco de laranja", category: "Bebidas", price: 9.5, stock: 31, accent: "#ffd166" },
  { id: "p5", sku: "SAL-031", name: "Tostex de queijo", category: "Lanches", price: 18.0, stock: 12, accent: "#f7c873" },
  { id: "p6", sku: "BEB-011", name: "Água com gás", category: "Bebidas", price: 5.0, stock: 64, accent: "#a8dadc" },
  { id: "p7", sku: "DOC-032", name: "Cookie de chocolate", category: "Doces", price: 7.5, stock: 9, accent: "#a98467" },
  { id: "p8", sku: "SAL-044", name: "Misto quente", category: "Lanches", price: 15.5, stock: 7, accent: "#e9c46a" },
];

export const recentSales = [
  { id: "#1048", time: "Hoje, 14:28", customer: "Balcão", items: 3, total: 27.4, method: "Cartão", status: "Concluída" },
  { id: "#1047", time: "Hoje, 14:12", customer: "Balcão", items: 1, total: 12, method: "Pix", status: "Concluída" },
  { id: "#1046", time: "Hoje, 13:56", customer: "Mesa 04", items: 4, total: 41.9, method: "Dinheiro", status: "Concluída" },
  { id: "#1045", time: "Hoje, 13:41", customer: "Balcão", items: 2, total: 15.5, method: "Cartão", status: "Concluída" },
];

export const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
