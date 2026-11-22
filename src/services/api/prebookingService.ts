import { z } from 'zod';
import { PrebookingCampaign, PrebookingOrder } from '../../types/prebooking';
import { SAMPLE_CAMPAIGNS, SAMPLE_BACKER_ORDERS } from '../mocks/seedData';
import { ServiceUserContext } from './problemService';

export const CreatePrebookingOrderSchema = z.object({
  campaignId: z.string().min(1),
  backerName: z.string().min(2, 'Name is required'),
  backerEmail: z.string().email('Invalid email address'),
  paymentType: z.enum(['REFUNDABLE_DEPOSIT', 'FULL_PAYMENT']),
  amountINR: z.number().positive(),
  paymentMethod: z.enum(['UPI', 'Card', 'NetBanking']),
  upiId: z.string().optional(),
});

export type CreatePrebookingOrderInput = z.infer<typeof CreatePrebookingOrderSchema>;

export interface IPrebookingService {
  getCampaigns(): Promise<PrebookingCampaign[]>;
  getCampaignBySlug(slug: string): Promise<PrebookingCampaign | null>;
  createOrder(input: CreatePrebookingOrderInput, user?: ServiceUserContext): Promise<PrebookingOrder>;
  getOrdersForBacker(
    email: string,
    user?: ServiceUserContext
  ): Promise<Array<PrebookingOrder & { campaign?: PrebookingCampaign }>>;
  cancelOrder(orderId: string, user?: ServiceUserContext): Promise<PrebookingOrder>;
}

const simulateDelay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

class MockPrebookingService implements IPrebookingService {
  private campaigns: PrebookingCampaign[] = [...SAMPLE_CAMPAIGNS];
  private orders: PrebookingOrder[] = [...SAMPLE_BACKER_ORDERS];

  async getCampaigns(): Promise<PrebookingCampaign[]> {
    await simulateDelay();
    return [...this.campaigns];
  }

  async getCampaignBySlug(slug: string): Promise<PrebookingCampaign | null> {
    await simulateDelay();
    const campaign = this.campaigns.find((c) => c.slug === slug || c.id === slug);
    return campaign ? { ...campaign } : null;
  }

  async createOrder(
    input: CreatePrebookingOrderInput,
    _user?: ServiceUserContext
  ): Promise<PrebookingOrder> {
    await simulateDelay();
    const validated = CreatePrebookingOrderSchema.parse(input);
    const campaign = this.campaigns.find((c) => c.id === validated.campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const newOrder: PrebookingOrder = {
      id: `ord_${Date.now()}`,
      campaignId: validated.campaignId,
      backerName: validated.backerName,
      backerEmail: validated.backerEmail,
      paymentType: validated.paymentType,
      amountINR: validated.amountINR,
      paymentMethod: validated.paymentMethod,
      status: 'Deposit_Secured',
      timestamp: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);

    // Update campaign progress
    campaign.currentBackersCount += 1;
    if (validated.paymentType === 'FULL_PAYMENT') {
      campaign.fullPaymentsCount += 1;
    } else {
      campaign.depositOnlyCount += 1;
    }

    if (campaign.currentBackersCount >= campaign.targetBackersThreshold) {
      campaign.depositStatus = 'Threshold Met';
    }

    return newOrder;
  }

  async getOrdersForBacker(
    email: string,
    user?: ServiceUserContext
  ): Promise<Array<PrebookingOrder & { campaign?: PrebookingCampaign }>> {
    await simulateDelay();

    // Role enforcement: If a BACKER calls, they can only view their own email's orders
    if (user && user.role === 'BACKER' && user.email) {
      if (email.toLowerCase() !== user.email.toLowerCase()) {
        throw new Error('Access Denied: Backers can only view their own pre-booking orders.');
      }
    }

    const userOrders = this.orders.filter(
      (o) => o.backerEmail.toLowerCase() === email.toLowerCase()
    );

    return userOrders.map((order) => ({
      ...order,
      campaign: this.campaigns.find((c) => c.id === order.campaignId),
    }));
  }

  async cancelOrder(orderId: string, user?: ServiceUserContext): Promise<PrebookingOrder> {
    await simulateDelay();
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Role enforcement: User must be the owner of the prebooking order to cancel and refund it
    if (user && user.role === 'BACKER' && user.email) {
      if (order.backerEmail.toLowerCase() !== user.email.toLowerCase()) {
        throw new Error('Access Denied: You cannot request refund for another backer\'s order.');
      }
    }

    order.status = 'Refunded';

    // Decrement campaign backer count
    const campaign = this.campaigns.find((c) => c.id === order.campaignId);
    if (campaign && campaign.currentBackersCount > 0) {
      campaign.currentBackersCount -= 1;
      if (order.paymentType === 'FULL_PAYMENT' && campaign.fullPaymentsCount > 0) {
        campaign.fullPaymentsCount -= 1;
      } else if (campaign.depositOnlyCount > 0) {
        campaign.depositOnlyCount -= 1;
      }
    }

    return { ...order };
  }
}

export const prebookingService: IPrebookingService = new MockPrebookingService();
