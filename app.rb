# require 'bundler'
# Bundler.require
require 'sinatra'
require 'redis'
require 'json'
# DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite://#{Dir.pwd}/development.sqlite")

# class CookieTray
#   include DataMapper::Resource

#   property :id, Serial, :key => true
#   property :created_at, DateTime
#   property :type, String, :length => 50
#   property :bake_time, Integer
#   property :time_in_oven, Integer
#   property :location, String, :length => 50
#   property :status, String, :length => 50
# end

# DataMapper.finalize
# DataMapper.auto_upgrade!

# configure do
#   services = JSON.parse(ENV['VCAP_SERVICES'])
#   redis_key = services.keys.select { |svc| svc =~ /redis/i }.first
#   redis = services[redis_key].first['credentials']
#   redis_conf = { :host => redis['hostname'], :port => redis['port'], :password => redis['password'] }
#   @@redis = Redis.new redis_conf
# end

@@redis = Redis.new

get '/' do
  send_file './public/index.html'
end

get '/cookies' do
  cookies = @@redis.hvals('cookies1')
  cookies.reject! do |cookie|
    cookie.scan(/(still_gooey)|(raw)/).empty?
  end
  cookies.to_json
end

post '/cookies' do
  content_type :json
  id = params[:id]
  @@redis.hset('cookies1', id, params[:cookie])
end
