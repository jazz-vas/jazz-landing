import axios from 'axios';
import { config } from './config';

export interface MsisdnResponse {
  success: boolean;
  data?: string;
  message?: string;
}

/**
 * Fetches MSISDN from the HTTP API endpoint
 * @returns Promise with MSISDN data
 */
export async function fetchMsisdn(): Promise<MsisdnResponse> {
  try {
    const response = await axios.get(config.msisdnApiUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.data && response.data.success && response.data.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to fetch MSISDN',
    };
  } catch (error: any) {
    console.error('MSISDN fetch error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: `Server error: ${error.response.status}`,
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error: Unable to reach the server',
      };
    }
    
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
    };
  }
}
