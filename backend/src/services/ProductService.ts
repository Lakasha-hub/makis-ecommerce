import { ProductRepository } from '../repositories/ProductRepository';
import { IProduct } from '../models/Product';
import { Types } from 'mongoose';

const productRepository = new ProductRepository();

export class ProductService {
  async getProducts(category?: string, material?: string, isAdmin = false): Promise<IProduct[]> {
    const filter: Record<string, any> = {};
    if (!isAdmin) filter.isActive = true;
    if (category) filter.category = category;
    if (material) filter.material = material;

    return productRepository.findAll(filter);
  }

  async getProductById(id: string): Promise<IProduct | null> {
    if (Types.ObjectId.isValid(id)) {
      const product = await productRepository.findById(id);
      if (product) return product;
    }
    
    // Fallback para mantener retrocompatibilidad (opcional, pero útil)
    return productRepository.findBySku(id);
  }

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    return productRepository.create(productData);
  }

  async updateProduct(id: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
    return productRepository.update(id, updateData);
  }

  async deleteProduct(id: string): Promise<IProduct | null> {
    return productRepository.softDelete(id);
  }

  async updateVariantStock(id: string, variantId: string, stock: number): Promise<IProduct | null> {
    return productRepository.updateVariantStock(id, variantId, stock);
  }
}
