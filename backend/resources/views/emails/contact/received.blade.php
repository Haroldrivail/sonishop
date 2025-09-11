@component('mail::message')
# Nouveau message de contact

**From:** {{ $payload['name'] }} <{{ $payload['email'] }}>

**Subject:** {{ $payload['subject'] ?? '(no subject)' }}

{{ $payload['message'] }}

Thanks,
{{ config('app.name') }}
@endcomponent
