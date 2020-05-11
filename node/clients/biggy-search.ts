import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'
import { IndexingType } from '../commons/compatibility-layer'
import path from 'path'

const buildPathFromArgs = (args: SearchResultArgs) => {
  const { attributePath, tradePolicy, indexingType } = args

  const policyAttr =
    tradePolicy && indexingType !== IndexingType.XML
      ? `trade-policy/${tradePolicy}`
      : ''

  return path.join(attributePath, policyAttr)
}

export class BiggySearchClient extends ExternalClient {
  private store: string

  public constructor(context: IOContext, options?: InstanceOptions) {
    super('http://search.biggylabs.com.br/search-api/v1/', context, options)

    const { account } = context
    this.store = account
  }

  public async topSearches(): Promise<any> {
    const result = await this.http.get<any>(`${this.store}/api/top_searches`, {
      metric: 'top-searches',
    })

    return result
  }

  public async suggestionSearches(args: SuggestionSearchesArgs): Promise<any> {
    const { term } = args

    const result = await this.http.get<any>(
      `${this.store}/api/suggestion_searches`,
      {
        params: {
          term,
        },
        metric: 'suggestion-searches',
      }
    )

    return result
  }

  public async suggestionProducts(args: SuggestionProductsArgs): Promise<any> {
    const {
      term,
      attributeKey,
      attributeValue,
      tradePolicy,
      indexingType,
    } = args
    const attributes: { key: string; value: string }[] = []

    if (attributeKey && attributeValue) {
      attributes.push({
        key: attributeKey,
        value: attributeValue,
      })
    }

    if (indexingType !== IndexingType.XML && tradePolicy) {
      attributes.push({
        key: 'trade-policy',
        value: tradePolicy,
      })
    }

    const result = await this.http.post<any>(
      `${this.store}/api/suggestion_products`,
      {
        term,
        attributes,
      },
      {
        metric: 'suggestion-products',
      }
    )

    return result
  }

  public async searchMetadata(args: SearchResultArgs): Promise<any> {
    const { query, page, count, sort, operator, fuzzy, leap } = args

    const url = `${this.store}/api/split/metadata_search/${buildPathFromArgs(
      args
    )}`

    const result = await this.http.getRaw(url, {
      params: {
        query,
        page,
        count,
        sort,
        operator,
        fuzzy,
        bgy_leap: leap ? true : undefined,
      },
      metric: 'search-result',
    })

    const { title, description: metaTagDescription } = result.data

    return {
      title,
      metaTagDescription,
    }
  }

  public async facets(args: SearchResultArgs): Promise<any> {
    const { query, page, count, sort, operator, fuzzy, leap } = args

    const url = `${this.store}/api/split/attribute_search/${buildPathFromArgs(
      args
    )}`

    const result = await this.http.getRaw(url, {
      params: {
        query,
        page,
        count,
        sort,
        operator,
        fuzzy,
        bgy_leap: leap ? true : undefined,
      },
      metric: 'search-result',
    })

    return result.data
  }

  public async productSearch(args: SearchResultArgs): Promise<any> {
    const { query, page, count, sort, operator, fuzzy, leap } = args

    const url = `${this.store}/api/split/product_search/${buildPathFromArgs(
      args
    )}`

    const result = await this.http.getRaw(url, {
      params: {
        query,
        page,
        count,
        sort,
        operator,
        fuzzy,
        bgy_leap: leap ? true : undefined,
      },
      metric: 'search-result',
    })

    return result.data
  }

  public async banners(args: SearchResultArgs): Promise<any> {
    const { fullText } = args

    const url = `${this.store}/api/split/banner_search/${buildPathFromArgs(
      args
    )}`

    const result = await this.http.getRaw(url, {
      params: {
        query: fullText,
      },
      metric: 'search-result',
    })

    return {
      banners: result.data.banners,
    }
  }

  public async autocompleteSearchSuggestions(args: {
    fullText: string
  }): Promise<any> {
    const { fullText } = args

    const result = await this.http.get<any>(
      `${this.store}/api/suggestion_searches`,
      {
        params: {
          term: fullText,
        },
        metric: 'search-autcomplete-suggestions',
      }
    )

    return result
  }

  public async correction(args: { fullText: string }): Promise<any> {
    const { fullText } = args

    const url = `${this.store}/api/split/correction_search/`

    const result = await this.http.getRaw(url, {
      params: {
        query: fullText,
      },
      metric: 'search-correction',
    })

    return {
      correction: result.data.correction,
    }
  }

  public async redirect(args: SearchResultArgs): Promise<any> {
    const { fullText } = args

    const url = `${this.store}/api/split/redirect_search/${buildPathFromArgs(
      args
    )}`

    const result = await this.http.getRaw(url, {
      params: {
        query: fullText,
      },
      metric: 'search-redirect',
    })

    return {
      url: result.data.redirect,
    }
  }

  public async searchSuggestions(args: { fullText: string }): Promise<any> {
    const { fullText } = args

    const url = `${this.store}/api/split/suggestion_search/`

    const result = await this.http.getRaw(url, {
      params: {
        query: fullText,
      },
      metric: 'search-suggestions',
    })

    return result.data.suggestion
  }
}
