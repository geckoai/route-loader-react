# React route loader factory

## Installing

```shell
pnpm install @geckoai/route-loader-react
```

Use repo https://registry.geckoai.cn/

## Example Usage

```ts
import { Typed } from '@geckoai/class-transformer';
import { ApiProperty, ApiRequest } from '@geckoai/http';
import { Pageable } from '../../../../common/models/definitions/Pageable';

@ApiRequest({
  url: '/api/user-service/role/list/pageable',
  method: 'get',
  description: '分页查询角色信息',
})
export class GetRoleListPageable extends Pageable {
  @ApiProperty({
    required: false,
    description: 'Bearer Token',
    in: 'header',
  })
  @Typed(String)
  public Authorization?: string;
  @ApiProperty({
    required: false,
    description: '部门ID',
    in: 'query',
    type: 'string',
  })
  @Typed(String)
  public departmentId?: string;
  @ApiProperty({
    required: false,
    description: '是否递归查找子部门',
    in: 'query',
    type: 'boolean',
  })
  @Typed(Boolean)
  public fetchChild?: boolean;
  @ApiProperty({
    required: false,
    description: '是否递归查找上级部门',
    in: 'query',
    type: 'boolean',
  })
  @Typed(Boolean)
  public fetchParent?: boolean;
  @ApiProperty({
    required: false,
    description: '角色名称',
    in: 'query',
    type: 'string',
  })
  @Typed(String)
  public name?: string;
  @ApiProperty({
    required: false,
    description: '状态: 0-录入 1-启用 2-禁用',
    in: 'query',
    type: 'string',
  })
  @Typed(String, {
    rules: {
      type: 'Enum',
      enums: ['0', '1', '2'],
    },
  })
  public status?: '0' | '1' | '2';
  @ApiProperty({
    required: false,
    description: '租户ID',
    in: 'query',
    type: 'string',
  })
  @Typed(String)
  public tenantId?: string;
}

```

```ts
import { RouteLoader } from '@geckoai/route-loader-react';
import { SysRoleVo } from './models/definitions/SysRoleVo';
import { GetRoleListPageable } from './models/GetRoleListPageable';

import { ApiProvide } from '../../../common/providers/api.provide';
import { HttpResource } from '../../../common/models/definitions/HttpResource';
import { PageInfo } from '../../../common/models/definitions/PageInfo';

export const { loader, usePreloadData, usePreloading } = RouteLoader.for(
  Preload.PreloadBuilder.for<
    HttpResource<PageInfo<SysRoleVo>>,
    GetRoleListPageable
  >(GetRoleListPageable, ApiProvide),
);
```

```tsx
import { usePreloading, usePreloadData } from './loader';
import { SysRoleVo } from './models/definitions/SysRoleVo';
import { AutoTable } from '@packages/components';
import { Button, Card, Flex } from 'antd';
import * as Search from './search';
import { useI18n } from '@geckoai/i18n-react';
import { SiteLocale } from '../../../common/locales';

export function Component() {
  const [first] = usePreloadData();
  const loading = usePreloading();
  const locales = useI18n<SiteLocale>();
  const [response, setData] = first.useState();

  return (
    <Flex
      vertical
      gap={10}
      style={{
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Card style={{ flexShrink: 0 }}>
        <Search.Form
          layout="inline"
          autoComplete="new-password"
          initialValues={first.query}
          onFinish={(v) =>
            setData((ori) => ({
              ...ori,
              ...v,
              pageNum: 1,
            }))
          }
        >
          <Search.Keyword placeholder={locales.please_input_keywords} />
          <Button htmlType="submit" type="primary" children={locales.search} />
        </Search.Form>
      </Card>

      <AutoTable.Card<SysRoleVo>
        style={{ flex: 1 }}
        loading={loading}
        dataSource={response.data?.list}
        columns={[
          {
            dataIndex: 'id',
            title: '#',
          },
          {
            dataIndex: 'name',
            title: 'Name',
          },
        ]}
        rowKey="id"
        pagination={{
          total: response.data?.total,
          current: response.data?.pageNum,
          pageSize: response.data?.pageSize,
          onChange: (pageNum, pageSize) =>
            setData((origin) => ({
              ...origin,
              pageSize,
              pageNum,
            })),
        }}
      />
    </Flex>
  );
}

export default Component;

```


## Issues
Create [issues](https://github.com/geckoai/route-loader-react/issues) in this repository. When creating issues please search for existing issues to avoid duplicates.


## License
Licensed under the [MIT](https://github.com/geckoai/route-loader-react/blob/master/LICENSE) License.