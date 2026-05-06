import {API_ENDPOINTS} from '@/shared/constants/api'
import { queryGet } from '@/shared/services/dataClient'
export const getSellerProfile = () => {
    return queryGet(API_ENDPOINTS.SELLER_PROFILE).then((res) => res.data?.data || res.data)
}
